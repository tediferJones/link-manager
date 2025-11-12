import { getItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { saveAndRender } from '@/app/lib/newVault/sync';
import { getParentPath, modifySortedKeys } from '@/app/lib/newVault/utils';
import { Content, Result, Vault } from '@/app/types';

export async function deleteItem(
  root: Vault['root'],
  path: string[]
): Promise<Result<Content>> {
  const itemTitle = path[path.length - 1];
  const parentPath = getParentPath(path);
  return returnOnFail(getItem(root, parentPath, 'folder'), async (parent) => {
    return returnOnFail(getItem(root, path), async (item) => {
      modifySortedKeys.delete(parent.sortedKeys, item);
      delete parent.contents[itemTitle];
      await saveAndRender();
      return { success: true, data: item };
    });
  });
}
