import { codeToHtml } from 'shiki';

/**
 * Minimal markdown-to-HTML renderer good enough for our hand-written docs.
 * Supports: headings, paragraphs, lists, links, inline code, fenced code
 * blocks (highlighted via shiki), blockquotes, horizontal rules. We avoid
 * heavier toolchains so the build stays fast on Cloudflare Pages.
 */
export async function renderMarkdown(src: string): Promise<string> {
  const lines = src.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] || 'text';
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      try {
        const html = await codeToHtml(code.join('\n'), {
          lang,
          theme: 'github-dark-dimmed',
        });
        out.push(html);
      } catch {
        out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      }
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const text = inline(h[2]);
      const slug = slugify(h[2]);
      out.push(`<h${level} id="${slug}">${text}</h${level}>`);
      i++;
      continue;
    }

    // horizontal rule
    if (/^-{3,}\s*$/.test(line)) {
      out.push('<hr />');
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`);
      continue;
    }

    // paragraph (collect until blank line)
    if (line.trim()) {
      const para: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*]\s|>|```)/.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      out.push(`<p>${inline(para.join(' '))}</p>`);
      continue;
    }

    i++;
  }

  return out.join('\n');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
