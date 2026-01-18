import { describe, expect, test } from 'vitest';
import { editItemTags } from '@/lib/newVault/details';
import { getNewVault } from '@/lib/newVault/utils';
import { addMockItem } from '@/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/lib/test/testResult';

describe('Edit tags', () => {
  const newTag = 'testTag';
  test('Add tag', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    const addTagResult = await editItemTags(root, resultPath, 'add', newTag);
    const item = testNewResultSuccess(addTagResult);
    expect(item.tags).toContain(newTag);
  });

  test('Remove tag', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    const addTagResult = await editItemTags(root, resultPath, 'add', newTag);
    const itemWithTag = testNewResultSuccess(addTagResult);
    expect(itemWithTag.tags).toContain(newTag);
    const deleteTagResult = await editItemTags(
      root,
      resultPath,
      'delete',
      newTag
    );
    const itemWithoutTag = testNewResultSuccess(deleteTagResult);
    expect(itemWithoutTag.tags).not.toContain(newTag);
  });

  test('Fail to add tag to encrypted folder', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(
      root,
      path,
      'encryptedFolder',
      'encFolder1'
    );
    testNewResultFailure(await editItemTags(root, resultPath, 'add', newTag));
  });

  // FIX ME add tests for adding/deleting multiple tags at once
});
