import { addItem, deleteItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { Content, Result, Vault } from '@/app/types';

export async function moveItem(
  root: Vault['root'],
  path: string[],
  newPath: string[]
): Promise<Result<Content>> {
  // FIX ME this seems like it could have the same problem as renameItem
  // if addItem fails then the item will have already been deleted
  return returnOnFail(await deleteItem(root, path), (item) => {
    return addItem(root, newPath, item);
  });
}
