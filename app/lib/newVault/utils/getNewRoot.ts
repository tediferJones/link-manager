import { getNewSortedKeys } from '@/app/lib/newVault/utils';
import { Vault } from '@/app/types';

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
