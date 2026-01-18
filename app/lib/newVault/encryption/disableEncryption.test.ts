import { describe, expect, test } from 'vitest';
import { getNewVault } from '@/lib/newVault/utils';
import { addMockItem } from '@/lib/test/addMockItem';
import {
  enableEncryption,
  disableEncryption,
} from '@/lib/newVault/encryption';
import {
  testNewResultFailure,
  testNewResultSuccess,
} from '@/lib/test/testResult';

// FIX ME move to constants
const password = 'password';

describe('Disable encryption', () => {
  test('Disable encryption', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    testNewResultSuccess(await enableEncryption(root, resultPath, password));
    const disabledEncryptionFolder = testNewResultSuccess(
      await disableEncryption(root, resultPath)
    );
    expect(disabledEncryptionFolder.encryption).toBeUndefined();
  });

  test('Attempt to disable encryption of item without encryption enabled',
    async () => {
      const { root, path } = getNewVault();
      const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
      testNewResultFailure(await disableEncryption(root, resultPath));
    }
  );
});
