import { expect, test } from 'vitest';
import returnOnFail from '@/lib/returnOnFail';
import { testResultFailure, testResultSuccess } from './testHelpers';

test('Use handler on success', () => {
  const result = returnOnFail({ success: true, data: 'someData' }, (data) => {
    expect(data).toBeTypeOf('string');
    return { success: true, data: 1 };
  });
  const data = testResultSuccess(result);
  expect(data).toBeTypeOf('number');
});

test('Skip handler on failure', () => {
  let testVal = false;
  const result = returnOnFail({ success: false, error: 'someError' }, () => {
    testVal = true;
    return { success: true, data: true };
  });
  testResultFailure(result);
  expect(testVal).toBe(false);
})
