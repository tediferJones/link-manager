import { describe, expect, test } from 'vitest';
import { deleteItem } from '@/lib/newVault/core';
import { getNewVault } from '@/lib/newVault/utils';
import { addMockItem } from '@/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/lib/test/testResult';

// FIX ME move to constants
const dnePath: string[] = [ 'thisItemDoesNotExist' ];

describe('Delete item', () => {
  test('Delete item from vault', async () => {
    const vault = getNewVault();
    const { root, path } = vault;
    const linkTitle = 'link1';
    const { result, resultPath } = await addMockItem(
      root,
      path,
      'link',
      linkTitle
    );
    testNewResultSuccess(result);
    testNewResultSuccess(await deleteItem(root, resultPath));
    expect(vault.root.contents[linkTitle]).toBeUndefined();
    expect(vault.root.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Attempt to delete item that does not exist', async () => {
    const { root } = getNewVault();
    testNewResultFailure(await deleteItem(root, dnePath));
  });
});
