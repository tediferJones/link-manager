import { newUserVault } from '@/lib/app/userVault';
import { getItem, unwrap } from '@/lib/newVault';

export function render() {
  const { root, path } = newUserVault;
  const item = unwrap(
    getItem(root, path, 'folder', 'encryptedFolder')
  );
  const event = new CustomEvent('render', { detail: item });
  window.dispatchEvent(event);
}
