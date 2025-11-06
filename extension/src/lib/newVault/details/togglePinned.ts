import { getItem } from '@/lib/newVault/core';
import { returnOnFail } from '@/lib/newVault/result';
import { saveAndRender } from '@/lib/newVault/sync';
import { getParentPath, modifySortedKeys } from '@/lib/newVault/utils';
import { Content, Result, Vault } from '@/types';

export async function togglePinned(
  root: Vault['root'],
  path: string[],
  force?: boolean,
): Promise<Result<Content>> {
  return returnOnFail(
    getItem(root, getParentPath(path), 'folder'),
    async (parent) => {
      return returnOnFail(getItem(root, path), async (item) => {
        modifySortedKeys.delete(parent.sortedKeys, item);
        item.pinned = force || !item.pinned;
        modifySortedKeys.add(parent.sortedKeys, item);
        await saveAndRender();
        return { success: true, data: item };
      });
    }
  );
}
