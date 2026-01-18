import { Content, SortedKeysTypes } from '@/types';

export function getSortedKeyType(item: Content): SortedKeysTypes {
  if (item.pinned) return 'pinned';
  if (item.type === 'encryptedFolder') return 'folder';
  return item.type;
}
