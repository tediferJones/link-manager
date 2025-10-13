import { beforeEach, describe, expect, test } from 'vitest';
import { AddItem } from '@/components/forms';
import {
  hrefInputId,
  submitBtnId,
  titleInputId,
} from '@/components/forms/addItem';
import { disabledBtnClasses, handleAddItemInput } from '@/effects';
import getElement from '@/lib/utils/getElement';

describe('Handle add item input', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.appendChild(<AddItem />);
  });

  test('Button disabled on initial render', () => {
    handleAddItemInput();
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(true);
    disabledBtnClasses.forEach(className => {
      expect(submitBtn.className).toContain(className);
    });
  });

  test('Button enabled if title filled', () => {
    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = 'title1';
    handleAddItemInput();
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
    disabledBtnClasses.forEach(className => {
      expect(submitBtn.className).not.toContain(className);
    });
    expect(submitBtn.textContent).toBe('Add Folder');
  });

  test('Button enabled if title and href filled', () => {
    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    const hrefInput = getElement<HTMLInputElement>(`#${hrefInputId}`);
    titleInput.value = 'title1';
    hrefInput.value = 'https://example.com';
    handleAddItemInput();
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
    disabledBtnClasses.forEach(className => {
      expect(submitBtn.className).not.toContain(className);
    });
    expect(submitBtn.textContent).toBe('Add Link');
  });

  test('Button disabled if only href is filled', () => {
    const hrefInput = getElement<HTMLInputElement>(`#${hrefInputId}`);
    hrefInput.value = 'https://example.com';
    handleAddItemInput();
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(true);
    disabledBtnClasses.forEach(className => {
      expect(submitBtn.className).toContain(className);
    });
  });
});
