import { describe, expect, test } from 'vitest';
import {
  decrypt,
  encrypt,
  getKey,
  getRandomBase64
} from '@/lib/utils/encryption';

describe('Encryption', () => {
  const password = 'password';
  const testData = 'Hello World';

  test('Create random salt', () => {
    const salt1 = getRandomBase64('salt');
    expect(salt1).toBeTypeOf('string');
    const salt2 = getRandomBase64('salt');
    expect(salt2).toBeTypeOf('string');
    expect(salt1).not.toBe(salt2);
  });

  test('Create random iv', () => {
    const iv1 = getRandomBase64('iv');
    expect(iv1).toBeTypeOf('string');
    const iv2 = getRandomBase64('iv');
    expect(iv2).toBeTypeOf('string');
    expect(iv1).not.toBe(iv2);
  });

  test('Get key', async () => {
    const salt = getRandomBase64('salt');
    const key = await getKey(password, salt);
    expect(key.type).toBe('secret');
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
  });

  test('Encrypt and decrypt', async () => {
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    const encrypted = await encrypt(testData, key, iv);
    const decrypted = await decrypt(encrypted, key, iv);
    expect(decrypted).toBe(testData);
  });

  test('Encrypt and decrypt empty string', async () => {
    const emptyString = '';
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    const encrypted = await encrypt(emptyString, key, iv);
    const decrypted = await decrypt(encrypted, key, iv);
    expect(decrypted).toBe(emptyString);
  });

  test('Fail to decrypt with wrong iv', async () => {
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    const encrypted = await encrypt(testData, key, iv);
    const wrongIv = getRandomBase64('iv');
    await expect(decrypt(encrypted, key, wrongIv)).rejects.toThrow();
  });

  test('Fail to decrypt with wrong salt', async () => {
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    const encrypted = await encrypt(testData, key, iv);
    const wrongSalt = getRandomBase64('salt');
    const wrongKey = await getKey(password, wrongSalt);
    await expect(decrypt(encrypted, wrongKey, iv)).rejects.toThrow();
  });

  test('Fail to decrypt with wrong password', async () => {
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    const encrypted = await encrypt(testData, key, iv);
    const wrongKey = await getKey('wrongPassword', salt);
    await expect(decrypt(encrypted, wrongKey, iv)).rejects.toThrow();
  });

  test('Fail to decrypt invalid data', async () => {
    const invalidData = '!!notbase64!!';
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    await expect(decrypt(invalidData, key, iv)).rejects.toThrow();
  });

  test('Encrypted output match with same iv', async () => {
    const salt = getRandomBase64('salt');
    const iv = getRandomBase64('iv');
    const key = await getKey(password, salt);
    const encrypted1 = await encrypt(testData, key, iv);
    const encrypted2 = await encrypt(testData, key, iv);
    expect(encrypted1).toBe(encrypted2);
  });

  test('Encrypted output mismatch with different iv', async () => {
    const salt = getRandomBase64('salt');
    const key = await getKey(password, salt);
    const iv1 = getRandomBase64('iv');
    const iv2 = getRandomBase64('iv');
    const encrypted1 = await encrypt(testData, key, iv1);
    const encrypted2 = await encrypt(testData, key, iv2);
    expect(encrypted1).not.toBe(encrypted2);
  });
});
