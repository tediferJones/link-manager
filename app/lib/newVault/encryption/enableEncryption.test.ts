import { describe, expect, test } from 'vitest';
import { enableEncryption } from '@/app/lib/newVault/encryption';
import { getNewVault } from '@/app/lib/newVault/utils';
import { addMockItem } from '@/app/lib/test/addMockItem';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/app/lib/test/testResult';

// FIX ME move to constants
const password = 'password';

describe('Enable encryption', async () => {
  test('Enable encryption of folder item', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    const encryptableFolder = testNewResultSuccess(
      await enableEncryption(root, resultPath, password)
    );
    // FIX ME maybe change to using the 'in' operator
    // see 'Encrypt without preserve arg' test for example
    expect(encryptableFolder.encryption).toBeDefined();
    expect(encryptableFolder.encryption!.key).toBeDefined();
    expect(encryptableFolder.encryption!.iv).toBeTypeOf('string');
    expect(encryptableFolder.encryption!.salt).toBeTypeOf('string');
  });

  test('Attempt to enable encryption of non-folder item', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    testNewResultFailure(await enableEncryption(root, resultPath, password));
  });
});
