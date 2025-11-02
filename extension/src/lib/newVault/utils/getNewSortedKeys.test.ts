import { expect, test } from 'vitest';
import { getNewSortedKeys } from '@/lib/newVault';
import { SortedKeysTypes } from '@/types';

test('test')

test('Sorted keys', () => {
  const newSortedKeys = getNewSortedKeys();
  // FIX ME sortedKeys should be an actual const array in the types file
  // this way it can be exported and used across the app
  //  - would be great for getNewSortedKeys
  // and used to define the types for SortedKeysTypes and SortedKeys
  const keys: SortedKeysTypes[] = [ 'pinned', 'folder', 'link', 'watched' ];
  keys.forEach(key => {
    expect(key in newSortedKeys).toBe(true);
    expect(Array.isArray(newSortedKeys[key])).toBe(true);
    expect(newSortedKeys[key]).toHaveLength(0);
  });
});
