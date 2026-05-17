import { newUserVault } from '@/app/lib/app/userVault';
import { saveAndRender } from '@/app/lib/newVault/sync';

export async function setPath(keys: string[], noPush?: 'noPush') {
  if (!noPush) {
    window.dispatchEvent(new CustomEvent('updateUrl', { detail: { keys } }));
  }
  newUserVault.path = keys;
  await saveAndRender();
}
