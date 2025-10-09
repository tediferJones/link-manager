import { expect } from 'vitest';
import Result from '@/lib/vault/Result';

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
