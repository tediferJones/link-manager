import '@/style.css';
import App from '@/app';
import setTheme from '@/lib/setTheme';
import { enableHotKeys } from '@/lib/hotkeys';
import { SizeTypes } from '@/types';
import getElement from './getElement';
import DirectoryView from '@/components/directoryView';

export default function start(type: SizeTypes) {
  setTheme();
  enableHotKeys();
  addEventListener('render', (e) => {
    const container = getElement('#directoryView');
    container.innerHTML = '';
    const item = (e as CustomEvent).detail;
    container.appendChild(DirectoryView({ item }));
    const breadcrumbs = getElement('#breadcrumbs');
    breadcrumbs.scrollLeft = breadcrumbs.scrollWidth;
  });
  document.querySelector('#app')!.appendChild(App({ type }));
}
