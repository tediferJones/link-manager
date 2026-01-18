import { getItem } from '@/lib/newVault/core';
import { unwrap } from '@/lib/newVault/result';
import { Vault } from '@/types';

export function getViewPath(root: Vault['root'], path: string[]): string[] {
  return path.reduce((newPath, segment) => {
    const item = unwrap(getItem(root, newPath));
    if (item.type === 'encryptedFolder') return newPath;
    return newPath.concat(segment);
  }, [] as string[]);
}
