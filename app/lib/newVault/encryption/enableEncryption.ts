import { getItem } from '@/lib/newVault/core';
import { getKey, getRandomBase64 } from '@/lib/utils/encryption';
import { returnOnFail } from '@/lib/newVault/result';
import { saveAndRender } from '@/lib/newVault/sync';
import { Content, Result, Vault } from '@/types';

export async function enableEncryption(
  root: Vault['root'],
  path: string[],
  password: string
): Promise<Result<Content<'folder'>>> {
  return returnOnFail(getItem(root, path, 'folder'), async (folder) => {
    const iv = getRandomBase64('iv');
    const salt = getRandomBase64('salt');
    const key = await getKey(password, salt);
    folder.encryption = { key, salt, iv };
    await saveAndRender();
    return { success: true, data: folder };
  });
}
