import { beforeEach, describe, expect, test } from 'vitest';
import { EditItem } from '@/components/forms';
import { passwordId, submitBtnId, titleId } from '@/components/forms/editItem';
import { createFolder, createLink } from '@/lib/test/mockItems';
import getElement from '@/lib/utils/getElement';

describe('Edit Item', () => {
  const title = 'link1';

  beforeEach(() => document.body.innerHTML = '');

  test('Title input contains item title on initial render', () => {
    document.body.appendChild(<EditItem item={createLink(title)} />);
    const titleInput = getElement<HTMLInputElement>(`#${titleId}`);
    expect(titleInput.value).toBe(title);
  });

  test('Submit button disabled on initial render', () => {
    document.body.appendChild(<EditItem item={createLink(title)} />);
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(true);
  });

  test('Submit button enabled when title changes', () => {
    document.body.appendChild(<EditItem item={createLink(title)} />);
    const titleInput = getElement<HTMLInputElement>(`#${titleId}`);
    titleInput.value = 'newTitle';
    const event = new KeyboardEvent('input', { bubbles: true, cancelable: true });
    titleInput.dispatchEvent(event);
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
  });

  test('Submit button enabled when password changes', () => {
    document.body.appendChild(<EditItem item={createFolder(title)} />);
    const passwordInput = getElement<HTMLInputElement>(`#${passwordId}`);
    passwordInput.value = 'password';
    const event = new KeyboardEvent('input', { bubbles: true, cancelable: true });
    passwordInput.dispatchEvent(event);
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
  });

  // FIX ME test if error message displays if there is a title collision
});
