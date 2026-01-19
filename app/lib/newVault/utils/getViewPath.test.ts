import { describe, expect, test } from 'vitest';
import { getNewVault, getViewPath } from '@/app/lib/newVault/utils';
import { addMockItem } from '@/app/lib/test/addMockItem';

describe('Get view path', () => {
  test('Stop at encrypted folder', async () => {
    const { root, path } = getNewVault();
    const { resultPath: path1 } = await addMockItem(root, path, 'folder', 'folder1');
    const { resultPath: path2 } = await addMockItem(root, path1, 'encryptedFolder', 'encFolder1');
    const { resultPath: path3 } = await addMockItem(root, path2, 'folder', 'folder2');

    const viewPath = getViewPath(root, path3);
    expect(viewPath).toEqual(path2);
  });

  test('Return full path if no children are encrypted', async () => {
    const { root, path } = getNewVault();
    const { resultPath: path1 } = await addMockItem(root, path, 'folder', 'folder1');
    const { resultPath: path2 } = await addMockItem(root, path1, 'folder', 'folder2');
    const { resultPath: path3 } = await addMockItem(root, path2, 'folder', 'folder3');

    const viewPath = getViewPath(root, path3);
    expect(viewPath).toEqual(path3);
  });
});

