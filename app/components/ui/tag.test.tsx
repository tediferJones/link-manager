import { describe, expect, test, vi } from 'vitest';
import Tag from '@/app/components/ui/tag';

describe('Tag', () => {
  const testVal = 'testValue';

  test('Display given value', () => {
    const tag = <Tag value={testVal} />;
    expect(tag.textContent).toBe(testVal);
  });

  test('Does not display X if xFunc is not provided', () => {
    const tag = <Tag value={testVal} />;
    expect(tag.querySelector('button')).toBeNull();
  });

  test('Display X if xFunc is provided', () => {
    const tag = <Tag value={testVal} xFunc={vi.fn()} />;
    expect(tag.querySelector('button')).not.toBeNull();
  });

  test('Clicking on X button runs xFunc', () => {
    const xFunc = vi.fn();
    const tag = <Tag value={testVal} xFunc={xFunc} />;
    tag.querySelector('button')!.click();
    expect(xFunc).toHaveBeenCalledOnce();
  });
});
