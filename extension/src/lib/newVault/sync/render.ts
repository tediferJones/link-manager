import { userVault } from '@/lib/app/newUserVault';
import { getItem, unwrap } from '@/lib/newVault';

export function render() {
  const { root, path } = userVault;
  const item = unwrap(
    getItem(root, path, 'folder', 'encryptedFolder')
  );
  const event = new CustomEvent('render', { detail: item });
  window.dispatchEvent(event);
}
