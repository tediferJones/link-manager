import { Content, Encrypted, Result, Vault } from '@/types';
import { getItem } from '@/lib/newVault/core';
import { returnOnFail } from '@/lib/newVault/result';
import { render } from '@/lib/newVault/sync';
import { decrypt, getKey, getRandomBase64 } from '@/lib/utils/encryption';
import replaceObject from '@/lib/utils/replaceObject';

export async function decryptFolder(
  root: Vault['root'],
  path: string[],
  password: string
): Promise<Result<Content<'folder'>>> {
  return returnOnFail(
    getItem(root, path, 'encryptedFolder'),
    async (encryptedFolder) => {
      const { iv, salt, data } = encryptedFolder;
      const key = await getKey(password, salt);
      let decryptedData: Encrypted;
      try {
        decryptedData = JSON.parse(await decrypt(data, key, iv));
      } catch {
        return { success: false, error: 'Failed to decrypt' }
      }
      const newIv = getRandomBase64('iv');
      const newSalt = getRandomBase64('salt');
      const newKey = await getKey(password, newSalt);
      const decryptedFolder: Content<'folder'> = {
        type: 'folder',
        title: encryptedFolder.title,
        pinned: encryptedFolder.pinned,
        date: encryptedFolder.date,
        ...decryptedData,
        encryption: {
          key: newKey,
          salt: newSalt,
          iv: newIv,
        },
      }
      replaceObject(encryptedFolder, decryptedFolder);
      render();
      return { success: true, data: decryptedFolder };
    }
  );
}
