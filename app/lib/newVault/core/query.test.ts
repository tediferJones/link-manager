import { describe, expect, test } from 'vitest';
import { query } from '@/lib/newVault/core';
import { getNewVault } from '@/lib/newVault/utils';
import { testNewResultSuccess } from '@/lib/test/testResult';
import { addMockItem } from '@/lib/test/addMockItem';
import { Content } from '@/types';

describe('Query vault', () => {
  test('Basic query', async () => {
    const { root, path } = getNewVault();
    const { result } = await addMockItem(root, path, 'link', 'link1');
    const item = testNewResultSuccess(result);
    await addMockItem(root, path, 'folder', 'folder1');
    const queryResult = testNewResultSuccess(
      await query(
        root,
        [],
        (found, item) => item.title === 'link1' ? item : found,
        {} as Content
      )
    );
    expect(queryResult).toBe(item);
  });

  test('Crawl nested directories', async () => {
    const { root, path } = getNewVault();
    const { resultPath: path1 } = await addMockItem(root, path, 'folder', 'folder1');
    const { resultPath: path2 } = await addMockItem(root, path1, 'folder', 'folder2');
    const { resultPath: path3 } = await addMockItem(root, path1, 'folder', 'folder3');
    await addMockItem(root, path2, 'folder', 'folder4');
    await addMockItem(root, path2, 'folder', 'link1');
    await addMockItem(root, path3, 'folder', 'folder5')
    await addMockItem(root, path3, 'folder', 'link2');
    const queryResult = testNewResultSuccess(
      await query(
        root,
        path,
        (allItems, item) => allItems.concat(item),
        [] as Content[],
      )
    );
    // 7 items + root = 8
    expect(queryResult).toHaveLength(8);
  });

  test('Crawl from given path', async () => {
    const { root, path } = getNewVault();
    const { resultPath: path1 } = await addMockItem(root, path, 'folder', 'folder1');
    const { resultPath: path2 } = await addMockItem(root, path1, 'folder', 'folder2');
    const { resultPath: path3 } = await addMockItem(root, path1, 'folder', 'folder3');
    await addMockItem(root, path2, 'folder', 'folder4');
    await addMockItem(root, path2, 'folder', 'link1');
    await addMockItem(root, path3, 'folder', 'folder5');
    await addMockItem(root, path3, 'folder', 'link2');
    const queryResult = testNewResultSuccess(
      await query(
        root,
        path2,
        (allItems, item) => allItems.concat(item),
        [] as Content[],
      )
    );
    expect(queryResult).toHaveLength(3);
  });
});
