import { getItem } from '@/lib/newVault/core';
import { returnOnFail } from '@/lib/newVault/result';
import { saveAndRender } from '@/lib/newVault/sync';
import { getParentPath, modifySortedKeys } from '@/lib/newVault/utils';
import { Content, Result, Vault } from '@/types';

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
