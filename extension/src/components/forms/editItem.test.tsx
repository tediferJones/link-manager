import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EditItem } from '@/components/forms';
import {
  passwordId,
  renameErrorId,
  submitBtnId,
  titleId
} from '@/components/forms/editItem';
import getElement from '@/lib/utils/getElement';
import { createFolder, createLink } from '@/lib/test/mockItems';

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

  test('Display error on result failure', async () => {
    document.body.appendChild(<EditItem item={createLink(title)} />);
    const titleInput = getElement<HTMLInputElement>(`#${titleId}`);
    titleInput.value = 'someOtherTitle';
    const event = new Event('submit', { bubbles: true, cancelable: true });
    titleInput.dispatchEvent(event);
    const renameError = getElement(`#error-${renameErrorId}`);
    await vi.waitFor(() => expect(renameError.textContent).toBeTruthy());
  });
});
