import { expect } from 'vitest';
import { Result as NewResult } from '@/types';

// FIX ME rename to testResultSuccess/Failure and fix all references

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
