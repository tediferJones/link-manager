import { getItem } from '@/lib/newVault/core';
import { returnOnFail } from '@/lib/newVault/result';
import { saveAndRender } from '@/lib/newVault/sync';
import { Content, Result, Vault } from '@/types';

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
    saveAndRender();
    return { success: true, data: folder };
  });
}
