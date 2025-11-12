import { beforeEach, describe, expect, test } from 'vitest';
import { Input } from '@/app/components/ui';
import { classes } from '@/app/components/ui/input';
import getElement from '@/app/lib/utils/getElement';

describe('Input', () => {
  const id = 'testId';
  const clearBtnId = `input-${id}-clear`;

  beforeEach(() => document.body.innerHTML = '');

  test('X hidden on initial render', () => {
    document.body.appendChild(<Input id={id} />);
    const x = getElement<HTMLButtonElement>(`#${clearBtnId}`);
    classes.hide.forEach(className => {
      expect(x.className).toContain(className);
    });
  });

  test('X shown when input focused', () => {
    document.body.appendChild(<Input id={id} />);
    const input = getElement<HTMLInputElement>(`#${id}`);
    const x = getElement<HTMLButtonElement>(`#${clearBtnId}`);
    const event = new Event('focus', { bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    classes.show.forEach(className => {
      expect(x.className).toContain(className);
    });
  });

  test('X hidden when input loses focus', () => {
    document.body.appendChild(<Input id={id} />);
    const input = getElement<HTMLInputElement>(`#${id}`);
    const x = getElement<HTMLButtonElement>(`#${clearBtnId}`);
    const focusEvent = new Event('focus', { bubbles: true, cancelable: true });
    input.dispatchEvent(focusEvent);
    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    input.dispatchEvent(blurEvent);
    classes.hide.forEach(className => {
      expect(x.className).toContain(className);
    });
  });

  test('Clear input when X is clicked', () => {
    document.body.appendChild(<Input id={id} />);
    const input = getElement<HTMLInputElement>(`#${id}`);
    const x = getElement<HTMLButtonElement>(`#${clearBtnId}`);
    input.value = 'testValue';
    x.click();
    expect(input.value).toBe('');
  });
});
