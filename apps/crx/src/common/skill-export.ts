import { renderSkillAsMarkdown } from '@skill-recorder/render';
import type { Skill } from '@skill-recorder/types';

const FOLDER = 'skill-recorder-skills';

/**
 * Auto-save a SKILL.md copy to a known Downloads subfolder so an external
 * reader (e.g. an AI assistant) can inspect every skill that was distilled.
 * Returns the relative path written.
 */
export async function autoSaveSkillMarkdown(skill: Skill): Promise<string> {
  const md = renderSkillAsMarkdown(skill);
  const base64 = btoa(unescape(encodeURIComponent(md)));
  const url = `data:text/markdown;charset=utf-8;base64,${base64}`;
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace(/Z$/, '');
  const filename = `${FOLDER}/${slugify(skill.title)}-${ts}.SKILL.md`;
  // saveAs:false bypasses Chrome's "Ask where to save each file" setting,
  // forcing the file into our subfolder instead of opening a save dialog.
  await chrome.downloads.download({ url, filename, conflictAction: 'uniquify', saveAs: false });
  return filename;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'skill'
  );
}
