import { expect, test } from 'vitest';
import throwOnFail from '@/lib/throwOnFail';

test('Extract data if successful', () => {
  const data = 'someData';
  const result = throwOnFail({ success: true, data });
  expect(result).toBe(data);
});

test('Throw error if unsuccessful', () => {
  const error = 'Operation failed';
  const testThrow = () => throwOnFail({ success: false, error });
  expect(testThrow).toThrowError();
});
