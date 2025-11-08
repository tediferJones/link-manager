import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EditItem } from '@/components/forms';
import {
  passwordId,
  renameErrorId,
  submitBtnId,
  titleId
} from '@/components/forms/editItem';
import getElement from '@/lib/utils/getElement';
import { mockItem } from '@/lib/test/mockItems';

vi.mock('@/effects', async () => {
  const actual = await vi.importActual('@/effects');
  return { ...actual, closeModal: vi.fn() };
});

describe('Edit Item', () => {
  const title = 'item1';

  beforeEach(() => document.body.innerHTML = '');

  test('Title input contains item title on initial render', () => {
    document.body.appendChild(<EditItem item={mockItem('link', title)} />);
    const titleInput = getElement<HTMLInputElement>(`#${titleId}`);
    expect(titleInput.value).toBe(title);
  });

  test('Submit button disabled on initial render', () => {
    document.body.appendChild(<EditItem item={mockItem('link', title)} />);
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(true);
  });

  test('Submit button enabled when title changes', () => {
    document.body.appendChild(<EditItem item={mockItem('link', title)} />);
    const titleInput = getElement<HTMLInputElement>(`#${titleId}`);
    titleInput.value = 'newTitle';
    const event = new KeyboardEvent('input', { bubbles: true, cancelable: true });
    titleInput.dispatchEvent(event);
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
  });

  test('Submit button enabled when password changes', () => {
    document.body.appendChild(<EditItem item={mockItem('folder', title)} />);
    const passwordInput = getElement<HTMLInputElement>(`#${passwordId}`);
    passwordInput.value = 'password';
    const event = new KeyboardEvent('input', { bubbles: true, cancelable: true });
    passwordInput.dispatchEvent(event);
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
  });

  test('Display error on result failure', async () => {
    document.body.appendChild(<EditItem item={mockItem('link', title)} />);
    const titleInput = getElement<HTMLInputElement>(`#${titleId}`);
    titleInput.value = 'someOtherTitle';
    const event = new Event('submit', { bubbles: true, cancelable: true });
    titleInput.dispatchEvent(event);
    const renameError = getElement(`#error-${renameErrorId}`);
    await vi.waitFor(() => expect(renameError.textContent).toBeTruthy());
  });
});
