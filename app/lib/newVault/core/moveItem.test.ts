import { describe, expect, test } from 'vitest';
import { moveItem, getItem } from '@/app/lib/newVault/core';
import { getNewVault, getParentPath } from '@/app/lib/newVault/utils';
import { addMockItem } from '@/app/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/app/lib/test/testResult';

// FIX ME move to constants
const dnePath: string[] = [ 'thisItemDoesNotExist' ];

describe('Move item', async () => {
  test('Move existing item to existing path', async () => {
    const { root, path } = getNewVault();
    const linkTitle = 'link1';
    const { result: linkResult, resultPath: linkPath } = await addMockItem(
      root,
      path,
      'link',
      linkTitle,
    )
    const linkItem = testNewResultSuccess(linkResult);
    const { result: folderResult, resultPath: folderPath } = await addMockItem(
      root,
      path,
      'folder',
      'folder1'
    )
    testNewResultSuccess(folderResult);
    testNewResultSuccess(await moveItem(root, linkPath, folderPath));
    testNewResultFailure(getItem(root, linkPath));
    const linkParent = testNewResultSuccess(
      getItem(root, getParentPath(linkPath), 'folder')
    );
    expect(linkParent.sortedKeys.link).not.toContain(linkTitle);
    const folder = testNewResultSuccess(getItem(root, folderPath, 'folder'));
    expect(folder.contents[linkTitle]).toBe(linkItem)
    expect(folder.sortedKeys.link).toContain(linkTitle);
  });

  test('Fail to move item that does not exist to existing path', async () => {
    const { root } = getNewVault();
    testNewResultFailure(await moveItem(root, dnePath, [ 'folder1' ]));
  });

  test('Fail to move existing item to path that does not exist', async () => {
    const { root } = getNewVault();
    testNewResultFailure(await moveItem(root, [ 'folder1' ], dnePath));
  });

  test('Fail to move item that does not exist to path that does not exist',
    async () => {
      const { root } = getNewVault();
      testNewResultFailure(await moveItem(root, dnePath, dnePath));
    }
  );

  // FIX ME write test to make sure item still exists if moveItem fails
});
