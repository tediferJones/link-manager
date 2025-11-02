import { Content, ContentTypes, Result, Vault } from '@/types';

export function getItem<T extends ContentTypes>(
  root: Vault['root'],
  path: string[],
  ...types: T[]
): Result<Content<T>> {
  const item = path.reduce<Content | undefined>((item, title) => {
    if (!item) return undefined;
    if (item.type === 'encryptedFolder') return item;
    if (item.type !== 'folder') return undefined;
    return item.contents[title];
  }, root);

  if (!item) {
    return {
      success: false,
      error: `Could not find item at: ${path.join('/')}`,
    }
  }

  if (types.length && !types.includes(item.type as T)) {
    return {
      success: false,
      error: `Item type is ${item.type}, expected: ${types.join(', ')}`,
    }
  }

  return {
    success: true,
    data: item as Content<T>,
  }
}
