import { getNewSortedKeys } from '@/lib/newVault/utils';
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
