import '@/style.css';
import App from '@/app';
import { DirectoryView } from '@/components/display';
import setTheme from '@/lib/app/setTheme';
import { enableHotKeys } from '@/lib/app/hotkeys';
import getElement from '@/lib/utils/getElement';
import { SizeTypes } from '@/types';
import { load } from '@/lib/newVault/sync';

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
