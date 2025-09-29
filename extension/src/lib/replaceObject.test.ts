import { expect, test } from 'vitest';
import replaceObject from '@/lib/replaceObject';

test('Replace', () => {
  const result = replaceObject({ prop1: true }, { prop2: false });
  expect(result.prop2).toBeDefined();
  expect(result.prop2).toBeFalsy();
  expect((result as any).prop1).toBeUndefined();
  expect(Object.keys(result).length).toBe(1);
});

test('Empty', () => {
  const result = replaceObject({ prop1: true }, {});
  expect((result as any).prop1).toBeUndefined();
  expect(Object.keys(result).length).toBe(0);
});

test('Fill', () => {
  const result = replaceObject({}, { prop2: false });
  expect(result.prop2).toBeDefined();
  expect(result.prop2).toBeFalsy();
  expect(Object.keys(result).length).toBe(1);
});
