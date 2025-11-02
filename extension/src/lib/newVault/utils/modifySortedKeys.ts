import { getSortedKeyType } from '@/lib/newVault';
import { Content, SortedKeys } from '@/types';

// FIX ME add strict type for object
// type SortedKeyActions = Actions | 'move';
// type ModifySortedKeysFunc<K extends SortedKeyActions> = K extends 'move'
//   ? (a: SortedKeys, b: Content, c: number) => SortedKeys
//     : (a: SortedKeys, b: Content) => SortedKeys
// type ModifySortedKeysMap = {
//   [K in SortedKeyActions]: ModifySortedKeysFunc<K>
// }
// FIX ME this object should only contain pure functions
export const modifySortedKeys = {
  add: (sortedKeys: SortedKeys, item: Content) => {
    const key = getSortedKeyType(item);
    if (key === 'pinned' || key === 'folder') {
      sortedKeys[key].push(item.title);
    } else {
      sortedKeys[key].unshift(item.title);
    }
    if (key === 'folder') {
      // FIX ME binary insert would be faster
      sortedKeys[key].sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      );
    }
  },
  delete: (sortedKeys: SortedKeys, item: Content) => {
    const key = getSortedKeyType(item);
    sortedKeys[key] = sortedKeys[key].filter(title => title !== item.title);
  },
  move: (sortedKeys: SortedKeys, item: Content, diff: number) => {
    const key = getSortedKeyType(item);
    const currentIndex = sortedKeys[key].indexOf(item.title);
    let newIndex = currentIndex + diff;
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex > sortedKeys[key].length) {
      newIndex = sortedKeys[key].length - 1;
    }
    [ 
      sortedKeys[key][currentIndex],
      sortedKeys[key][newIndex],
    ] = [
        sortedKeys[key][newIndex],
        sortedKeys[key][currentIndex],
      ];
  },
}
