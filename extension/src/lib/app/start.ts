import '@/style.css';
import App from '@/app';
import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/utils/getElement';
import setTheme from '@/lib/app/setTheme';
import { enableHotKeys } from '@/lib/app/hotkeys';
import { SizeTypes } from '@/types';

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
