import { getItem } from '@/app/lib/newVault/core';
import { returnOnFail } from '@/app/lib/newVault/result';
import { saveAndRender } from '@/app/lib/newVault/sync';
import { getParentPath, modifySortedKeys } from '@/app/lib/newVault/utils';
import replaceObject from '@/app/lib/utils/replaceObject';
import { Content, Vault } from '@/app/types';

export async function toggleWatched(
  root: Vault['root'],
  path: string[],
  force?: boolean,
) {
  return returnOnFail(
    getItem(root, getParentPath(path), 'folder'),
    async (parent) => {
      return returnOnFail(
        getItem(root, path, 'link', 'watched'),
        async (item) => {
          if (item.type === 'link') {
            if (force === false) return { success: true, data: item };
            const watched: Content<'watched'> = {
              ...item,
              type: 'watched',
              watched: Date.now(),
            }
            if (!item.pinned) modifySortedKeys.delete(parent.sortedKeys, item);
            replaceObject(item, watched);
            if (!item.pinned) modifySortedKeys.add(parent.sortedKeys, watched);
          } else if (item.type === 'watched') {
            if (force === true) return { success: true, data: item };
            // FIX ME typescript will not throw an error if extra items are spread into Content<'link'>
            // try to find some way to fix that
            const { watched, ...rest } = item;
            const link: Content<'link'> = {
              ...rest,
              type: 'link',
            }
            if (!item.pinned) modifySortedKeys.delete(parent.sortedKeys, item);
            replaceObject(item, link);
            if (!item.pinned) modifySortedKeys.add(parent.sortedKeys, link);
          }
          await saveAndRender();
          return { success: true, data: item };
        }
      );
    }
  );
}
