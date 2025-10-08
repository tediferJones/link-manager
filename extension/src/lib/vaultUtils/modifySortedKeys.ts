import { Content, SortedKeys, SortedKeysTypes } from '@/types';

export function getItemType(item: Content): SortedKeysTypes {
  if (item.pinned) return 'pinned';
  if (item.type === 'encryptedFolder') return 'folder';
  return item.type;
}

// FIX ME make some kind of type for this
const modifySortedKeys = {
  add: (sortedKeys: SortedKeys, item: Content) => {
    const key = getItemType(item);
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
    const key = getItemType(item);
    sortedKeys[key] = sortedKeys[key].filter(title => title !== item.title);
  },
  move: (sortedKeys: SortedKeys, item: Content, diff: number) => {
    const key = getItemType(item);
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

export default modifySortedKeys;
