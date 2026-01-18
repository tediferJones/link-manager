import { addItem } from '@/lib/newVault/core';
import { mockItem, togglePinned } from '@/lib/test/mockItems';
import { ContentTypes, Vault } from '@/types';

export async function addMockItem(
  root: Vault['root'],
  path: string[],
  type: ContentTypes,
  title: string,
  pinned?: boolean
) {
  const item = mockItem(type, title);
  let addedResult = await addItem(root, path, item);
  if (pinned !== undefined && addedResult.success) {
    addedResult.data = togglePinned(addedResult.data, pinned);
  }
  return { result: addedResult, resultPath: path.concat(item.title) };
}
