import { OptPromise, Result } from '@/app/types';

export async function returnOnFail<T, K>(
  result: Result<T>,
  callback: (data: T) => OptPromise<Result<K>>
): Promise<Result<K>> {
  if (!result.success) return result;
  return await callback(result.data);
}
