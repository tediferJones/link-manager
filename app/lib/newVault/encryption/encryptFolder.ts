import { getItem } from '@/app/lib/newVault/core';
import { render } from '@/app/lib/newVault/sync';
import { returnOnFail, unwrap } from '@/app/lib/newVault/result';
import asyncReduce from '@/app/lib/utils/asyncReduce';
import replaceObject from '@/app/lib/utils/replaceObject';
import { encrypt } from '@/app/lib/utils/encryption';
import { Content, Encrypted, Result, Vault } from '@/app/types';

export async function encryptFolder(
  root: Vault['root'],
  path: string[],
  preserve?: 'preserve'
): Promise<Result<Content<'encryptedFolder'>>> {
  return returnOnFail(getItem(root, path, 'folder'), async (folder) => {
    if (!folder.encryption) {
      return {
        success: false,
        error: `Folder ${path.join('/')} does not have encryption enabled`,
      }
    }
    const {
      encryption,
      contents,
      pinned,
      title,
      tags,
      sortedKeys,
      date,
    } = folder;

    const packedContents = await asyncReduce(
      Object.keys(contents),
      async (packedContents, title) => {
        const item = contents[title];
        if (item.type === 'folder' && item.encryption) {
          const encrypted = unwrap(
            await encryptFolder(root, path.concat(title), preserve)
          );
          packedContents[title] = encrypted;
        } else {
          packedContents[title] = item;
        }
        return packedContents;
      },
      {} as Content<'folder'>['contents']
    );

    const toEncrypt: Encrypted = {
      contents: packedContents,
      tags,
      sortedKeys,
    }

    const encryptedFolder: Content<'encryptedFolder'> = {
      type: 'encryptedFolder',
      title,
      pinned, 
      date,
      data: await encrypt(
        JSON.stringify(toEncrypt),
        encryption.key,
        encryption.iv
      ),
      salt: encryption.salt,
      iv: encryption.iv,
    }
    if (!preserve) replaceObject(folder, encryptedFolder);
    render();
    return { success: true, data: encryptedFolder }
  });
}
