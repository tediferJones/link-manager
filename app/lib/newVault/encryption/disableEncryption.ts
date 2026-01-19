import { getItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { saveAndRender } from '@/app/lib/newVault/sync';
import { Content, Result, Vault } from '@/app/types';

export async function disableEncryption(
  root: Vault['root'],
  path: string[]
): Promise<Result<Content<'folder'>>> {
  return returnOnFail(getItem(root, path, 'folder'), async (folder) => {
    if (!folder.encryption) {
      return {
        success: false,
        error: 'Item does not have encryption enabled',
      }
    }
    delete folder.encryption;
    await saveAndRender();
    return { success: true, data: folder };
  });
}
