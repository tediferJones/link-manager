import { describe, expect, test } from 'vitest';
import { getItem } from '@/lib/newVault/core';
import { enableEncryption, encryptFolder } from '@/lib/newVault/encryption';
import { getNewVault } from '@/lib/newVault/utils';
import { testNewResultFailure, testNewResultSuccess } from '@/lib/test/testResult';
import { addMockItem } from '@/lib/test/addMockItem';

// FIX ME move to constants
const password = 'password';

describe('Encrypt folder', () => {
  test('Encrypt folder', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    await enableEncryption(root, resultPath, password);
    await encryptFolder(root, resultPath);
    const encryptedResult = getItem(root, resultPath, 'encryptedFolder');
    const encrypted = testNewResultSuccess(encryptedResult);
    expect(encrypted.iv).toBeTypeOf('string');
    expect(encrypted.salt).toBeTypeOf('string');
    expect(encrypted.data).toBeTypeOf('string');
    expect('contents' in encrypted).toBe(false);
    expect('tags' in encrypted).toBe(false);
    expect('sortedKeys' in encrypted).toBe(false);
  });

  test('Attempt encrypting folder without encryption enabled', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    testNewResultSuccess(getItem(root, resultPath));
    testNewResultFailure(await encryptFolder(root, resultPath));
  });

  test('Encrypt with preserve arg', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    const enableEncryptionResult = await enableEncryption(
      root,
      resultPath,
      password,
    );
    const encryptableFolder = testNewResultSuccess(enableEncryptionResult);
    testNewResultSuccess(await encryptFolder(root, resultPath, 'preserve'));
    const encryptedWithPreserve = testNewResultSuccess(
      getItem(root, resultPath)
    );
    expect(encryptedWithPreserve).toBe(encryptableFolder);
  });

  test('Encrypt without preserve arg', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    const encryptableFolder = testNewResultSuccess(
      await enableEncryption(root, resultPath, password)
    );
    testNewResultSuccess(await encryptFolder(root, resultPath));
    // FIX ME make a function that will differentiate between folders and encryptedFolders based on keys
    // ideally this should be directly linked to the types file
    // maybe create const arrays for these keys and derive types from these arrays?
    // then export those arrays and use them here for testing
    expect('data' in encryptableFolder).toBe(true);
    expect('iv' in encryptableFolder).toBe(true);
    expect('salt' in encryptableFolder).toBe(true);
    expect('content' in encryptableFolder).toBe(false);
    expect('tags' in encryptableFolder).toBe(false);
    expect('sortedKeys' in encryptableFolder).toBe(false);
  });
});

