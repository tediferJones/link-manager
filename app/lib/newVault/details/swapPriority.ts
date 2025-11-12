import { getItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { saveAndRender } from '@/app/lib/newVault/sync';
import { getParentPath, modifySortedKeys } from '@/app/lib/newVault/utils';
import { Content, Result, Vault } from '@/app/types';

export async function swapPriority(
  root: Vault['root'],
  path: string[],
  diff: number,
): Promise<Result<Content<'link'>>> {
  return returnOnFail(
    getItem(root, getParentPath(path), 'folder'),
    async (parent) => {
      return returnOnFail(getItem(root, path, 'link'), async (link) => {
        modifySortedKeys.move(parent.sortedKeys, link, diff);
        await saveAndRender();
        return { success: true, data: link };
      });
    }
  );
}
