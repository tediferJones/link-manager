import { expect, test } from 'vitest';
import getNewVault from '@/lib/getNewVault';
import getTypedKeys from '@/lib/getTypedKeys';

test('Root folder', () => {
  const rootFolder = getNewVault();
  expect(rootFolder.type).toBe('folder');
  expect(rootFolder.title).toBe('');
  expect(rootFolder.contents).toEqual({});
  expect(Array.isArray(rootFolder.tags)).toBe(true);
  expect(rootFolder.tags).toHaveLength(0);
  expect(rootFolder.pinned).toBe(false);
  expect(rootFolder.sortedKeys).toBeDefined();
  getTypedKeys(rootFolder.sortedKeys).forEach(key => {
    const sortedKey = rootFolder.sortedKeys[key];
    expect(Array.isArray(sortedKey)).toBe(true);
    expect(sortedKey).toHaveLength(0);
  });
});
