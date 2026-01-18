import { SortedKeys } from '@/types';

export function getNewSortedKeys(): SortedKeys {
  return {
    pinned: [],
    folder: [],
    link: [],
    watched: [],
  }
}
