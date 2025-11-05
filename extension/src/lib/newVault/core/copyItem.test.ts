import { describe, expect, test } from 'vitest';
import { copyItem } from '@/lib/newVault/core';
import { getNewVault } from '@/lib/newVault/utils';
import { addMockItem } from '@/lib/test/addMockItem';
import { testNewResultSuccess } from '@/lib/test/testResult';

describe('Copy item', async () => {
  test('Copy without title collision', async () => {
    const linkTitle = 'link1';
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', linkTitle);
    const copyResult = await copyItem(root, resultPath);
    const item = testNewResultSuccess(copyResult);
    expect(item.title).toBe(`${linkTitle}-COPY`);
  });

  test('Copy with title collision', async () => {
    const linkTitle = 'link1';
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', linkTitle);
    testNewResultSuccess(await copyItem(root, resultPath));
    const copyDuplicate = testNewResultSuccess(
      await copyItem(root, resultPath)
    );
    expect(copyDuplicate.title).toBe(`${linkTitle}-COPY-COPY`);
  });

  // FIX ME test copying item that does not exist

  // FIX ME test if copy will fail after reaching maxAttempt value
  // easy test: pass a lower maxAttempt value or higher attempt start value
});
