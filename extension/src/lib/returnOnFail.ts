import { ResultObj } from '@/types';

export default function returnOnFail<T, K>(
  result: ResultObj<T>,
  handler: (item: T) => ResultObj<K>,
): ResultObj<K> {
  if (!result.success) return result;
  return handler(result.data);
}
