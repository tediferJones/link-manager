import { expect, test } from 'vitest';
import Result from '@/lib/Result';

test('Result success', () => {
  const result = Result.success(0);
  expect(result.success).toBe(true);
  expect(result.data).toBe(0);
  expect(result.error).toBeUndefined();
});

test('Result failure', () => {
  const result = Result.failure('Error message');
  expect(result.success).toBe(false);
  expect(result.data).toBeUndefined();
  expect(result.error).toBeTypeOf('string');
  expect(result.error).toBeTruthy();
});

test('Result success chaining', () => {
  const result = Result.success(1).next((num) => {
    if (num === 1) {
      return Result.success(num + 1);
    } else {
      return Result.failure('Error message');
    }
  });
  expect(result.success).toBe(true);
  expect(result.data).toBe(2);
  expect(result.error).toBeUndefined();
});

test('Result failure chaining', () => {
  let runCheck = false;
  const result = Result.failure('Error message').next((data) => {
    runCheck = true;
    return Result.success(data);
  });
  expect(result.success).toBe(false);
  expect(result.error).toBeTypeOf('string');
  expect(result.error).toBeTruthy();
  expect(runCheck).toBe(false);
});

test('Result extract', () => {
  const data = Result.success(1).extract();
  expect(data).toBe(1);
});

test('Attempt result extract', () => {
  const data = Result.failure('Error message').extract();
  expect(data).toBeUndefined();
});
