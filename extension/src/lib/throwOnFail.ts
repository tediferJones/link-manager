import { ResultObj } from '@/types';

export default function throwOnFail<T extends any>(result: ResultObj<T>): T {
  if (result.success) return result.data;
  throw Error(result.error);
}
