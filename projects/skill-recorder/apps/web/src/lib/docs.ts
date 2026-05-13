import fs from 'node:fs/promises';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

export interface DocFrontmatter {
  slug: string;
  title: string;
  description?: string;
  order: number;
  locale: 'en' | 'zh';
}

export interface DocPage extends DocFrontmatter {
  body: string;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (key) meta[key] = value;
  }
  return { meta, body: match[2] };
}

export async function listDocs(locale: 'en' | 'zh' = 'en'): Promise<DocPage[]> {
  const localeDir = path.join(DOCS_DIR, locale);
  let files: string[];
  try {
    files = await fs.readdir(localeDir);
  } catch {
    files = [];
  }
  const out: DocPage[] = [];
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = await fs.readFile(path.join(localeDir, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    out.push({
      slug: file.replace(/\.mdx?$/, ''),
      title: meta.title || file,
      description: meta.description,
      order: Number(meta.order ?? 100),
      locale,
      body,
    });
  }
  return out.sort((a, b) => a.order - b.order);
}

export async function getDoc(slug: string, locale: 'en' | 'zh' = 'en'): Promise<DocPage | null> {
  const all = await listDocs(locale);
  return all.find((d) => d.slug === slug) ?? null;
}
