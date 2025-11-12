import { describe, expect, test } from 'vitest';
import { getItem } from '@/app/lib/newVault/core';
import { getNewVault } from '@/app/lib/newVault/utils';
import { addMockItem } from '@/app/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/app/lib/test/testResult';

describe('Get item', async () => {
  test('Get any item', async () => {
    const { root, path } = getNewVault();

    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    testNewResultSuccess(getItem(root, resultPath));
  });

  test('Get typed link', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    const item = testNewResultSuccess(getItem(root, resultPath, 'link'));
    expect(item.type).toBe('link');
  });

  test('Get item with wrong type', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    testNewResultFailure(getItem(root, resultPath, 'folder'));
  });

  // FIX ME should probably make tests for more combos of item types
  // for every type, test that it gets the right item for no type and every other type
});
