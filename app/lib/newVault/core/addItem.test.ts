import { describe, expect, test } from 'vitest';
import { getNewVault } from '@/app/lib/newVault/utils';
import { unwrap } from '@/app/lib/newVault/result';
import { addMockItem } from '@/app/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/app/lib/test/testResult';

describe('Add item', () => {
  test('Add item to vault', async () => {
    const vault = getNewVault();
    const { root, path } = vault;
    const { result } = await addMockItem(root, path, 'link', 'link1');
    const item = unwrap(result);
    expect(vault.root.contents[item.title]).toBe(item);
    expect(vault.root.sortedKeys.link).toContain(item.title);
  });

  test('Fail to add duplicate', async () => {
    const { root, path } = getNewVault();
    const { result: result1 } = await addMockItem(root, path, 'link', 'link1');
    testNewResultSuccess(result1);
    const { result: result2 } = await addMockItem(root, path, 'link', 'link1');
    testNewResultFailure(result2);
  });
});
