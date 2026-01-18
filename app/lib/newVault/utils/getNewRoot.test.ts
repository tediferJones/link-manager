import { expect, test } from 'vitest';
import { getNewRoot } from '@/lib/newVault/utils';
import getTypedKeys from '@/lib/utils/getTypedKeys';

test('Root folder', () => {
  const rootFolder = getNewRoot();
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
