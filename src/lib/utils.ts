import type { Record, Vault } from '@/types';

export function clearChildren(id: string) {
  const parent = document.querySelector(`#${id}`);
  if (!parent) throw Error(`failed to find parent container for given id: ${id}`);
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  return parent;
}

export function isFolder(item: Vault | Record): item is Vault {
  return 'contents' in item
}

// export function isLocked(item: Vault | Record) {
//   return !('contents' in item) && 'locked' in item
// }

