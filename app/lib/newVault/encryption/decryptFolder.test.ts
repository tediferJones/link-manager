import { describe, expect, test } from 'vitest';
import {
  enableEncryption,
  encryptFolder,
  decryptFolder,
} from '@/lib/newVault/encryption';
import { getNewVault } from '@/lib/newVault/utils';
import { addMockItem } from '@/lib/test/addMockItem';
import { testNewResultFailure, testNewResultSuccess } from '@/lib/test/testResult';

// FIX ME move to constants
const password = 'password';
const dnePath: string[] = [ 'thisItemDoesNotExist' ];

describe('Decryption', () => {
  test('Decrypt encrypted folder', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    testNewResultSuccess(await enableEncryption(root, resultPath, password));
    testNewResultSuccess(await encryptFolder(root, resultPath));
    const decryptedItem = testNewResultSuccess(
      await decryptFolder(root, resultPath, password)
    );
    expect(decryptedItem.type).toBe('folder');
    expect('contents' in decryptedItem).toBe(true);
    expect('sortedKeys' in decryptedItem).toBe(true);
    expect('tags' in decryptedItem).toBe(true);
    expect('encryption' in decryptedItem).toBe(true);
    if (decryptedItem.encryption) {
      expect('key' in decryptedItem.encryption).toBe(true);
      expect('iv' in decryptedItem.encryption).toBe(true);
      expect('salt' in decryptedItem.encryption).toBe(true);
    }
  });

  test('Attempt decrypt with wrong password', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    testNewResultSuccess(await enableEncryption(root, resultPath, password));
    testNewResultSuccess(await encryptFolder(root, resultPath));
    testNewResultFailure(
      await decryptFolder(root, resultPath, 'wrongPassword')
    );
  });

  test('Attempt decrypt with invalid path', async () => {
    const { root } = getNewVault();
    testNewResultFailure(await decryptFolder(root, dnePath, password));
  });

  test('Attempt decrypt of not encrypted item', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'folder', 'folder1');
    testNewResultFailure(await decryptFolder(root, resultPath, password));
  });
});
