import { getItem } from '@/lib/newVault/core';
import { returnOnFail } from '@/lib/newVault/result';
import { saveAndRender } from '@/lib/newVault/sync';
import { getParentPath, modifySortedKeys } from '@/lib/newVault/utils';
import { Content, Result, Vault } from '@/types';

export async function deleteItem(
  root: Vault['root'],
  path: string[]
): Promise<Result<Content>> {
  const itemTitle = path[path.length - 1];
  const parentPath = getParentPath(path);
  return returnOnFail(getItem(root, parentPath, 'folder'), async (parent) => {
    return returnOnFail(getItem(root, path), (item) => {
      modifySortedKeys.delete(parent.sortedKeys, item);
      delete parent.contents[itemTitle];
      saveAndRender();
      return { success: true, data: item };
    });
  });
}
