import { describe, expect, test } from 'vitest';
import { renameItem, getItem } from '@/app/lib/newVault/core';
import { getNewVault } from '@/app/lib/newVault/utils';
import { addMockItem } from '@/app/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/app/lib/test/testResult';

// FIX ME move to constants
const dnePath: string[] = [ 'thisItemDoesNotExist' ];

describe('Rename item', () => {
  test('Rename existing item', async () => {
    const { root, path } = getNewVault();
    const linkTitle = 'link1';
    const { result, resultPath } = await addMockItem(
      root,
      path,
      'link',
      linkTitle
    );
    const item = testNewResultSuccess(result);
    const newTitle = `${linkTitle}-RENAMED`;
    const renamedPath = path.concat(newTitle);
    testNewResultSuccess(await renameItem(root, resultPath, newTitle));
    const renamedItem = testNewResultSuccess(getItem(root, renamedPath));
    expect(renamedItem).toBe(item);
  });

  test('Fail to rename item that does not exist', async () => {
    const { root } = getNewVault();
    testNewResultFailure(await renameItem(root, dnePath, 'newTitle'));
  });

  // FIX ME write test to make sure item still exists if renameItem fails
});
