import { addItem } from '@/lib/newVault/core';
import { mockItem } from '@/lib/test/mockItems';
import { Vault } from '@/types';

export async function addMockItem(
  root: Vault['root'],
  path: string[],
  type: 'folder' | 'link',
  title: string,
) {
  const item = mockItem(type, title);
  const addedResult = await addItem(root, path, item);
  return { result: addedResult, resultPath: path.concat(item.title) };
}
