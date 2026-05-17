import '@/app/style.css';
import App from '@/app/app';
import { DirectoryView } from '@/app/components/display';
import setTheme from '@/app/lib/app/setTheme';
import { enableHotKeys } from '@/app/lib/app/hotkeys';
import getElement from '@/app/lib/utils/getElement';
import { SizeTypes } from '@/app/types';
import { load, setPath } from '@/app/lib/newVault/sync';
import getJwt from '@/app/lib/utils/getJwt';
import { authContainerId } from '@/app/lib/constants';
import { Auth } from '@/app/components/ui';
import { openModal } from '@/app/effects';
import { UserAuth } from '@/app/components/forms';
import { newUserVault } from '@/app/lib/app/userVault';

export default function start(type: SizeTypes) {
  setTheme();
  enableHotKeys();
  window.addEventListener('render', async (e) => {
    const item = (e as CustomEvent).detail;
    getElement('#directoryView').replaceChildren(DirectoryView({ item }));
  });
  window.addEventListener('getJwt', async (e) => {
    await getJwt();
    const { reload, preservePath } = (e as CustomEvent).detail;
    if (reload) await load({ preservePath });
    getElement(`#${authContainerId}`).replaceChildren(Auth());
  });
  if (type === 'website') {
    window.addEventListener('popstate', async (e) => {
      await setPath(e.state?.segments || [], 'noPush');
    });
    window.addEventListener('updateUrl', async (e) => {
      const { keys } = (e as CustomEvent).detail;
      const path = '/' + keys.map(encodeURIComponent).join('/');
      window.history.pushState({ segments: keys }, '', path);
    });
    if (window.location.pathname !== '/') {
      newUserVault.path = (
        window.location.pathname
        .split('/')
        .filter(Boolean)
        .map(decodeURIComponent)
      );
    }
  }
  getElement('#app').appendChild(App({ type }));
  // FIX ME make customEvent type to skip casting as CustomEvent
  // created a getCustomEvent helper to enforce the above types
  dispatchEvent(
    new CustomEvent('getJwt', { detail: { reload: true, preservePath: true } })
  );

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('token')) {
    openModal('Reset Password', UserAuth({ type: 'reset' }));
  }
}
