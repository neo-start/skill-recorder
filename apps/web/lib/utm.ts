/**
 * Central CTA destination URL — Chrome Web Store listing for Skill Recorder.
 *
 * Until the CWS submission goes live, this points at the GitHub releases page
 * so the install CTA still resolves somewhere meaningful.
 */
export const CTA_URL =
  process.env.NEXT_PUBLIC_CTA_URL ??
  'https://github.com/neo-start/skill-recorder/releases';

/**
 * Appends UTM parameters to a URL.
 *
 *   - source   : always 'web'
 *   - medium   : always 'cta'
 *   - campaign : optional (defaults to 'launch')
 *   - content  : identifies which CTA triggered the click
 */
export function withUTM(
  url: string,
  content: string,
  { campaign = 'launch', page }: { campaign?: string; page?: string } = {}
): string {
  if (!url) return '#';
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'web');
    u.searchParams.set('utm_medium', 'cta');
    u.searchParams.set('utm_campaign', campaign);
    u.searchParams.set('utm_content', page ? `${page}_${content}` : content);
    return u.toString();
  } catch {
    return url;
  }
}
