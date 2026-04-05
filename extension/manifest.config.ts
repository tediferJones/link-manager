import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';
import { apiUrl } from 'shared/constants';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  content_scripts: [{
    js: ['src/content/main.ts'],
    matches: ['https://*/*'],
  }],
  permissions: [
    'sidePanel',
    'contentSettings',
    'storage',
    'cookies',
  ],
  host_permissions: [ `${apiUrl}/*` ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
