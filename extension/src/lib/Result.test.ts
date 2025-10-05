import { expect, test } from 'vitest';
import Result from '@/lib/Result';

test('Result success', () => {
  const result = Result.success(0);
  const success = result.success();
  expect(success).toBe(true);
  if (success) {
    expect(result.data()).toBe(0);
    expect(() => result.error()).toThrowError();
  }
});

test('Result failure', () => {
  const result = Result.failure('Error message');
  const success = result.success();
  expect(success).toBe(false);
  if (!success) {
    const error = result.error();
    expect(error).toBeTypeOf('string');
    expect(error).toBeTruthy();
    expect(() => result.data()).toThrowError();
  }
});

test('Result success chaining', async () => {
  const result = await Result.success(1).next((num) => {
    if (num === 1) {
      return Result.success(num + 1);
    } else {
      return Result.failure('Error message');
    }
  });
  const success = result.success();
  expect(success).toBe(true);
  if (success) {
    expect(result.data()).toBe(2);
    expect(() => result.error()).toThrowError();
  }
});

test('Result failure chaining', async () => {
  let runCheck = false;
  const result = await Result.failure('Error message').next((data) => {
    runCheck = true;
    return Result.success(data);
  });
  const success = result.success();
  expect(success).toBe(false);
  if (!success) {
    const error = result.error();
    expect(error).toBeTypeOf('string');
    expect(error).toBeTruthy();
    expect(runCheck).toBe(false);
  }
});

test('Throw on failure', async () => {
  const result = (
    await Result.success(2).next(() => Result.failure('Error message'))
  );
  expect(() => result.throw()).toThrowError();
});

test('Proceed on success', async () => {
  const result = await (
    Result.success(1)
    .throw()
    .next(data => Result.success(data + 1))
  );
  expect(result.success()).toBe(true);
  expect(result.data()).toBe(2);
});
