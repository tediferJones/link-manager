import { addItem, deleteItem } from '@/app/lib/newVault/core';
import { getParentPath } from '@/app/lib/newVault/utils';
import { returnOnFail } from '@/app/lib/newVault/result';
import { Content, Result, Vault } from '@/app/types';

export async function renameItem(
  root: Vault['root'],
  path: string[],
  newTitle: string
): Promise<Result<Content>> {
  // FIX ME if title already exists item will just get deleted
  // addItem will fail but deleteItem will have already happened
  return returnOnFail(await deleteItem(root, path), (item) => {
    item.title = newTitle;
    return addItem(root, getParentPath(path), item);
  })
}
