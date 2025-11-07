import { Content, OptPromise, Vault } from '@/types';
import { getItem } from './getItem';
import { returnOnFail } from '../result';
import asyncReduce from '@/lib/utils/asyncReduce';

export async function query<T>(
  root: Vault['root'],
  path: string[],
  func: (accumulator: T, item: Content) => OptPromise<T>,
  accumulator: T
) {
  return returnOnFail(getItem(root, path), async (item) => {
    accumulator = await func(accumulator, item);
    if (item.type === 'folder') {
      accumulator = await asyncReduce(
        Object.keys(item.contents),
        async (accumulator, title) => {
          if (item.contents[title].type === 'folder') {
            const queryResult = await query(
              root,
              path.concat(title),
              func,
              accumulator
            );
            if (!queryResult.success) throw Error(queryResult.error);
            accumulator = queryResult.data;
          } else {
            accumulator = await func(accumulator, item.contents[title]);
          }
          return accumulator;
        },
        accumulator,
      );
    }
    return { success: true, data: accumulator };
  });
}
