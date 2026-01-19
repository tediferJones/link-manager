import { describe, expect, test } from 'vitest';
import getTypedKeys from '@/app/lib/utils/getTypedKeys';

describe('Get typed keys', () => {
  test('Keys match', () => {
    const keys = [ 'key1', 'key2', 'key3' ];
    const object = keys.reduce((obj, key) => {
      obj[key] = true;
      return obj;
    }, {} as { [key: string]: true });
    const typedKeys = getTypedKeys(object);
    expect(typedKeys).toEqual(keys);
  });
});
