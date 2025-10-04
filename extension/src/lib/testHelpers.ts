import { expect } from 'vitest';
import { ResultObj } from '@/types';

export function testResultFailure<T>(result: ResultObj<T>) {
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toBeTruthy();
}

export function testResultSuccess<T>(result: ResultObj<T>): T {
  expect(result.success).toBe(true);
  if (!result.success) throw Error('Result success failed');
  return result.data;
}
