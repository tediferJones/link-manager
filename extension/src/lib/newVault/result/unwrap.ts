import { Result } from '@/types'

export function unwrap<T>(result: Result<T>) {
  if (!result.success) throw Error(result.error);
  return result.data;
}
