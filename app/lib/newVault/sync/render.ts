import { newUserVault } from '@/lib/app/userVault';
import { getItem } from '@/lib/newVault/core';
import { unwrap } from '@/lib/newVault/result';

export function render() {
  const { root, path } = newUserVault;
  const item = unwrap(
    getItem(root, path, 'folder', 'encryptedFolder')
  );
  const event = new CustomEvent('render', { detail: item });
  window.dispatchEvent(event);
}
