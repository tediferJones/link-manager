import '@/app/style.css';
import App from '@/app/app';
import { DirectoryView } from '@/app/components/display';
import setTheme from '@/app/lib/app/setTheme';
import { enableHotKeys } from '@/app/lib/app/hotkeys';
import getElement from '@/app/lib/utils/getElement';
import { SizeTypes } from '@/app/types';
import { load } from '@/app/lib/newVault/sync';

export default function start(type: SizeTypes) {
  setTheme();
  enableHotKeys();
  window.addEventListener('render', (e) => {
    const item = (e as CustomEvent).detail;
    getElement('#directoryView').replaceChildren(DirectoryView({ item }));
  });
  getElement('#app').appendChild(App({ type }));
  load();
}
