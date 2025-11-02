import { OptPromise, Result } from '@/types';

// FIX ME delete if not used

export async function throwOnFail<T, K>(
  result: Result<T>,
  callback: (data: T) => OptPromise<Result<K>>
): Promise<Result<K>> {
  if (!result.success) throw Error(result.error);
  return await callback(result.data);
}
