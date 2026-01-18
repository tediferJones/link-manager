import { getItem } from '@/lib/newVault/core';
import { returnOnFail } from '@/lib/newVault/result';
import { saveAndRender } from '@/lib/newVault/sync';
import { modifyTags } from '@/lib/newVault/utils';
import { Actions, Content, Result, Vault } from '@/types';

export async function editItemTags(
  root: Vault['root'],
  path: string[],
  action: Actions,
  ...tags: string[]
): Promise<Result<Content<'folder' | 'link' | 'watched'>>> {
  return returnOnFail(
    getItem(root, path, 'folder', 'link', 'watched'),
    async (item) => {
      tags.forEach(tag => item.tags = modifyTags[action](item.tags, tag));
      await saveAndRender();
      return { success: true, data: item };
    }
  );
}
