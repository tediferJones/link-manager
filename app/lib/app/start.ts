import '@/app/style.css';
import App from '@/app/app';
import { DirectoryView } from '@/app/components/display';
import setTheme from '@/app/lib/app/setTheme';
import { enableHotKeys } from '@/app/lib/app/hotkeys';
import getElement from '@/app/lib/utils/getElement';
import { SizeTypes } from '@/app/types';
import { load } from '@/app/lib/newVault/sync';
import getJwt from '@/app/lib/utils/getJwt';
import { authContainerId } from '@/app/lib/constants';
import { Auth } from '@/app/components/ui';

export default function start(type: SizeTypes) {
  setTheme();
  enableHotKeys();
  window.addEventListener('render', async (e) => {
    const item = (e as CustomEvent).detail;
    getElement('#directoryView').replaceChildren(DirectoryView({ item }));
  });
  window.addEventListener('getJwt', async (e) => {
    await getJwt();
    const { reload } = (e as CustomEvent).detail;
    if (reload) load();
    getElement(`#${authContainerId}`).replaceChildren(Auth());
  });
  getElement('#app').appendChild(App({ type }));
  dispatchEvent(new CustomEvent('getJwt', { detail: { reload: true } }));
}
