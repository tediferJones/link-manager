import { SortedKeys } from '@/types';

export default function getNewSortedKeys(): SortedKeys {
  return {
    pinned: [],
    folder: [],
    link: [],
    watched: [],
  }
}
