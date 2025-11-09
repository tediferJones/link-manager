import { addItem, deleteItem } from '@/lib/newVault/core';
import { getParentPath } from '@/lib/newVault/utils';
import { returnOnFail } from '@/lib/newVault/result';
import { Content, Result, Vault } from '@/types';

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
