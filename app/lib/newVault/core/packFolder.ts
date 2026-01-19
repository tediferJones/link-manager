import { getItem } from '@/app/lib/newVault/core';
import { encryptFolder } from '@/app/lib/newVault/encryption'
import { returnOnFail, unwrap } from '@/app/lib/newVault/result';
import asyncReduce from '@/app/lib/utils/asyncReduce';
import { Content, Result, Vault } from '@/app/types';

// FIX ME write tests

export async function packFolder(
  root: Vault['root'],
  path: string[] = [],
): Promise<Result<Content<'folder'>>> {
  return returnOnFail(getItem(root, path, 'folder'), async (folder) => {
    const packedContents = await asyncReduce(
      Object.keys(folder.contents),
      async (packedContents, title) => {
        const item = folder.contents[title];
        if (item.type === 'folder' && item.encryption) {
          const encrypted = unwrap(
            await encryptFolder(root, path.concat(title), 'preserve')
          );
          packedContents[title] = encrypted;
        } else if (item.type === 'folder') {
          const packed = await packFolder(root, path.concat(title))
          if (!packed.success) throw Error(packed.error);
          packedContents[title] = packed.data;
        } else {
          packedContents[title] = item;
        }
        return packedContents;
      },
      {} as Content<'folder'>['contents']
    );

    return {
      success: true,
      data: { ...folder, contents: packedContents },
    }
  });
}
