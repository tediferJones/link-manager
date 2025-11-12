import { getItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { saveAndRender } from '@/app/lib/newVault/sync';
import { modifySortedKeys } from '@/app/lib/newVault/utils';
import { Content, Result, Vault } from '@/app/types';

// FIX ME
// Ideally this should look like this:
//
// async add<T extends 'link' | 'folder'>(
//   item: Content<T>,
//   path: string[]
// ): Promise<Result<Content<T>>> {
export async function addItem(
  root: Vault['root'],
  path: string[],
  item: Content
): Promise<Result<Content>> {
  return returnOnFail(getItem(root, path, 'folder'), async (parent) => {
    if (parent.contents[item.title]) {
      return { success: false, error: 'Title already used' }
    }
    parent.contents[item.title] = item;
    modifySortedKeys.add(parent.sortedKeys, item);
    await saveAndRender();
    return { success: true, data: item }
  });
}
