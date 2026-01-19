import { getItem } from '@/app/lib/newVault/core';
import { getKey, getRandomBase64 } from '@/app/lib/utils/encryption';
import { returnOnFail } from '@/app/lib/newVault/result';
import { saveAndRender } from '@/app/lib/newVault/sync';
import { Content, Result, Vault } from '@/app/types';

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
