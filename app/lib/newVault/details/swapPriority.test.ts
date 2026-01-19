import { describe, expect, test } from 'vitest';
import { getItem } from '@/app/lib/newVault/core';
import { swapPriority } from '@/app/lib/newVault/details';
import { getNewVault, getParentPath } from '@/app/lib/newVault/utils';
import { testNewResultSuccess } from '@/app/lib/test/testResult';
import { addMockItem } from '@/app/lib/test/addMockItem';

describe('Swap priority', () => {
  test('Swap +1', async () => {
    const { root, path } = getNewVault();
    await addMockItem(root, path, 'link', 'link1');
    const { result, resultPath } = await addMockItem(root, path, 'link', 'link2');
    await addMockItem(root, path, 'link', 'link3');

    const item = testNewResultSuccess(result);
    testNewResultSuccess(await swapPriority(root, resultPath, 1));
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[2]).toBe(item.title);
  });

  test('Swap -1', async () => {
    const { root, path } = getNewVault();
    await addMockItem(root, path, 'link', 'link1');
    const { result, resultPath } = await addMockItem(root, path, 'link', 'link2');
    await addMockItem(root, path, 'link', 'link3');

    const item = testNewResultSuccess(result);
    testNewResultSuccess(await swapPriority(root, resultPath, -1));
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[0]).toBe(item.title);
  });

  test('Swap to first position', async () => {
    const { root, path } = getNewVault();
    const addedItems = await Promise.all(
      Array(5).fill(0).map(async (_, i) => {
        return await addMockItem(root, path, 'link', `link${i}`);
      })
    );
    const { result, resultPath } = addedItems[4];
    const item = testNewResultSuccess(result);
    testNewResultSuccess(await swapPriority(root, resultPath, -Infinity));
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[0]).toBe(item.title);
  });

  test('Swap to last position', async () => {
    const { root, path } = getNewVault();
    const addedItems = await Promise.all(
      Array(5).fill(0).map(async (_, i) => {
        return await addMockItem(root, path, 'link', `link${i}`);
      })
    );
    const { result, resultPath } = addedItems[1];
    const item = testNewResultSuccess(result);
    testNewResultSuccess(await swapPriority(root, resultPath, Infinity));
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[4]).toBe(item.title);
  });
});
