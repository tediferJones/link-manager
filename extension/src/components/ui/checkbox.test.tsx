/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, test, vi } from 'vitest';
import { Checkbox } from '@/components/ui';
import getElement from '@/lib/utils/getElement';

describe('Checkbox', () => {
  const inputId = 'testId';
  const displayId = `${inputId}-display`;

  afterEach(() => document.body.innerHTML = '');

  test('Has checkbox and is hidden', () => {
    document.body.appendChild(<Checkbox id={inputId} />);
    const input = getElement<HTMLInputElement>(`#${inputId}`);
    expect(input.id).toBe(inputId);
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('checkbox');
    expect(input.className).toContain('hidden');
  });

  test('Render unchecked when checked is undefined', () => {
    document.body.appendChild(<Checkbox id={inputId} />);
    const input = getElement<HTMLInputElement>(`#${inputId}`);
    expect(input.checked).toBe(false);
    const display = getElement<HTMLDivElement>(`#${displayId}`);
    expect(display.childElementCount).toBe(0);
  });

  test('Render checked when checked is true', () => {
    document.body.appendChild(<Checkbox id={inputId} checked={true} />);
    const input = getElement<HTMLInputElement>(`#${inputId}`);
    expect(input.checked).toBe(true);
    const display = getElement<HTMLDivElement>(`#${displayId}`);
    expect(display.childElementCount).toBe(1);
  });

  test('Render unchecked when checked is false', () => {
    document.body.appendChild(<Checkbox id={inputId} checked={false} />);
    const input = getElement<HTMLInputElement>(`#${inputId}`);
    expect(input.checked).toBe(false);
    const display = getElement<HTMLDivElement>(`#${displayId}`);
    expect(display.childElementCount).toBe(0);
  });

  test('Responds to user action', () => {
    const handleChange = vi.fn();
    document.body.appendChild(<Checkbox id={inputId} onChange={handleChange} />);
    const input = getElement<HTMLInputElement>(`#${inputId}`);
    const display = getElement<HTMLDivElement>(`#${displayId}`);

    display.click();
    expect(input.checked).toBe(true);
    expect(display.childElementCount).toBe(1);
    expect(handleChange).toHaveBeenCalledTimes(1);

    display.click();
    expect(input.checked).toBe(false);
    expect(display.childElementCount).toBe(0);
    expect(handleChange).toHaveBeenCalledTimes(2);
  });
});
