import { beforeEach, describe, expect, test } from 'vitest';
import getElement from '@/lib/utils/getElement';

describe('Get element', () => {
  beforeEach(() => document.body.innerHTML = '');

  test('Get element if it exists', () => {
    const div = document.createElement('div');
    div.id = 'test';
    document.body.appendChild(div);
    expect(getElement('#test')).toBe(div);
  });

  test('Throw if element not found', () => {
    expect(() => getElement('#test')).toThrow();
  });
});
