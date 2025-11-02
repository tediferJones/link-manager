import {
  returnOnFail,
  getItem,
  modifySortedKeys,
  saveAndRender
} from '@/lib/newVault';
import { Content, Result, Vault } from '@/types';

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
  return returnOnFail(getItem(root, path, 'folder'), (parent) => {
    if (parent.contents[item.title]) {
      return { success: false, error: 'Title already used' }
    }
    parent.contents[item.title] = item;
    modifySortedKeys.add(parent.sortedKeys, item);
    saveAndRender();
    return { success: true, data: item }
  });
}
