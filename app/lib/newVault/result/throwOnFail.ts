import { Result } from '@/types';

// FIX ME delete if not used

export async function throwOnFail<T>(
  result: Result<T>,
): Promise<Result<T>> {
  if (!result.success) throw Error(result.error);
  return result;
}
