import { Content } from '@/types';
import getNewSortedKeys from '@/lib/vault/getNewSortedKeys';

export default function getNewVault(): Content<'folder'> {
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
