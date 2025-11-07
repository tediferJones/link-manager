import { getItem } from '@/lib/newVault/core';
import { Vault } from '@/types';

export function getViewPath(root: Vault['root'], path: string[]): string[] {
  return path.reduce((newPath, segment) => {
    const itemResult = getItem(root, newPath);
    if (!itemResult.success) throw Error(itemResult.error);
    const item = itemResult.data;
    if (item.type === 'encryptedFolder') return newPath;
    return newPath.concat(segment);
  }, [] as string[]);
}
