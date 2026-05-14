import type { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { renderMarkdown } from '@/lib/markdown';
import { pageMeta } from '@/lib/seo';
import type { Locale } from '@/i18n';
import { Container } from '@/components/Container';

interface Entry {
  version: string;
  date: string;
  html: string;
}

async function loadEntries(): Promise<Entry[]> {
  const dir = path.join(process.cwd(), 'content', 'changelog');
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const entries: Entry[] = [];
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const meta: Record<string, string> = {};
    let body = raw;
    if (match) {
      for (const line of match[1].split('\n')) {
        const idx = line.indexOf(':');
        if (idx < 0) continue;
        meta[line.slice(0, idx).trim()] = line
          .slice(idx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
      }
      body = match[2];
    }
    entries.push({
      version: meta.version || file.replace(/\.mdx?$/, ''),
      date: meta.date || '',
      html: await renderMarkdown(body),
    });
  }
  return entries.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'changelog' });
  return pageMeta({
    title: t('heading'),
    description: t('lede'),
    path: '/changelog',
    locale,
  });
}

export default async function ChangelogPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'changelog' });
  const entries = await loadEntries();
  return (
    <Container>
      <div style={{ padding: '56px 0' }}>
        <h1 style={{ fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{t('heading')}</h1>
        <p style={{ color: '#8a93a3', maxWidth: 620, margin: '0 0 40px' }}>{t('lede')}</p>
        {entries.length === 0 && <p>{t('empty')}</p>}
        {entries.map((e) => (
          <article
            key={e.version}
            style={{
              padding: '24px 0',
              borderTop: '1px solid #222732',
            }}
          >
            <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>v{e.version}</h2>
              <span style={{ color: '#5a6273', fontSize: 13 }}>{e.date}</span>
            </header>
            <div
              style={{ lineHeight: 1.7, color: '#e6ebf2' }}
              dangerouslySetInnerHTML={{ __html: e.html }}
            />
          </article>
        ))}
      </div>
    </Container>
  );
}
