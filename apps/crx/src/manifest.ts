import { defineManifest } from '@crxjs/vite-plugin';
import pkg from '../package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Skill Recorder',
  version: pkg.version,
  description: 'Record and replay user actions on a web page.',
  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  action: {
    default_title: 'Skill Recorder',
  },
  background: {
    service_worker: 'src/modules/background/index.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'src/modules/sidepanel/index.html',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/modules/content/index.ts'],
      run_at: 'document_start',
      // Inject into every frame so iframe interactions are captured and replayed.
      // Frame identity is tracked per-(tabId, frameId) in the background.
      all_frames: true,
    },
  ],
  permissions: ['sidePanel', 'storage', 'scripting', 'tabs', 'alarms', 'activeTab', 'webNavigation', 'downloads'],
  host_permissions: ['<all_urls>'],
  web_accessible_resources: [
    {
      resources: ['src/modules/player/index.html', 'assets/*'],
      matches: ['<all_urls>'],
    },
  ],
});
