import { getItem, addItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { Content, Result, Vault } from '@/app/types';

export async function copyItem(
  root: Vault['root'],
  path: string[],
  attempt = 1,
): Promise<Result<Content>> {
  const parentPath = path.slice(0, -1);
  return returnOnFail(getItem(root, path), async (item) => {
    const itemCopy: typeof item = JSON.parse(JSON.stringify(item));
    itemCopy.title = `${item.title}${'-COPY'.repeat(attempt)}`;
    const addResult = await addItem(root, parentPath, itemCopy);
    if (!addResult.success) return copyItem(root, path, attempt + 1);
    return addResult;
  });
}
