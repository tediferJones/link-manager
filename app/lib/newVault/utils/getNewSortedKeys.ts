import { SortedKeys } from '@/app/types';

export function getNewSortedKeys(): SortedKeys {
  return {
    pinned: [],
    folder: [],
    link: [],
    watched: [],
  }
}
