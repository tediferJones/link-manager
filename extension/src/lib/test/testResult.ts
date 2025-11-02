import { expect } from 'vitest';
import Result from '@/lib/vault/Result';
import { Result as NewResult } from '@/types';

export function testResultFailure<T>(result: Result<T>) {
  expect(result.success()).toBe(false);
  expect(result.error()).toBeTypeOf('string');
  expect(result.error()).toBeTruthy();
}

export function testResultSuccess<T>(result: Result<T>) {
  expect(result.success()).toBe(true);
  expect(result.data()).toBeDefined();
  return result.data();
}

export function testNewResultSuccess<T>(result: NewResult<T>) {
  expect(result.success).toBe(true);
  if (!result.success) throw Error();
  expect(result.data).toBeDefined();
  return result.data;
}

export function testNewResultFailure<T>(result: NewResult<T>) {
  expect(result.success).toBe(false);
  if (result.success) throw Error();
  expect(result.error).toBeTypeOf('string');
  expect(result.error).toBeTruthy();
  return result.error;
}
