import { describe, expect, test } from 'vitest';
import { getItem } from '@/lib/newVault/core';
import { togglePinned } from '@/lib/newVault/details';
import { getNewVault, getParentPath } from '@/lib/newVault/utils';
import { testNewResultSuccess } from '@/lib/test/testResult';
import { addMockItem } from '@/lib/test/addMockItem';

describe('Toggle pinned', () => {
  const linkTitle = 'link1'

  test('Toggle pinned true', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', linkTitle);
    const item = testNewResultSuccess(await togglePinned(root, resultPath));
    expect(item.pinned).toBe(true);
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(resultPath), 'folder')
    );
    expect(parent.sortedKeys.pinned).toContain(linkTitle);
    expect(parent.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Toggle pinned false', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(
      root,
      path,
      'link',
      linkTitle,
      true
    );
    const item = testNewResultSuccess(await togglePinned(root, resultPath));
    expect(item.pinned).toBe(false);
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(resultPath), 'folder')
    );
    expect(parent.sortedKeys.link).toContain(linkTitle);
    expect(parent.sortedKeys.pinned).not.toContain(linkTitle);
  });

  test('Force pinned true', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', linkTitle);
    const item = testNewResultSuccess(
      await togglePinned(root, resultPath, true)
    );
    expect(item.pinned).toBe(true);
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(resultPath), 'folder')
    );
    expect(parent.sortedKeys.pinned).toContain(linkTitle);
    expect(parent.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Force pinned false', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(
      root,
      path,
      'link',
      linkTitle,
      true
    );
    const item = testNewResultSuccess(
      await togglePinned(root, resultPath, false)
    );
    expect(item.pinned).toBe(false);
    const parent = testNewResultSuccess(
      getItem(root, getParentPath(resultPath), 'folder')
    );
    expect(parent.sortedKeys.link).toContain(linkTitle);
    expect(parent.sortedKeys.pinned).not.toContain(linkTitle);
  });
});
