import { getNewSortedKeys } from '@/lib/newVault';
import { Vault } from '@/types';

export function getNewRoot(): Vault['root'] {
  return {
    type: 'folder',
    title: '',
    contents: {},
    tags: [],
    pinned: false,
    sortedKeys: getNewSortedKeys(),
    date: Date.now(),
  }
}
