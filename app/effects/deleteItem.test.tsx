import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DeleteItem } from '@/components/forms';
import { submitBtnId, titleInputId } from '@/components/forms/deleteItem';
import { handleDeleteItemInput } from '@/effects';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

vi.mock('@/effects/modal', () => ({ closeModal: vi.fn() }));

describe('Delete item', () => {
  const itemTitle = 'title1';
  const wrongTitle = 'wrongTitle';
  const item = { title: itemTitle } as Content<'link'>;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.appendChild(<DeleteItem item={item} />);
  });

  test('Submit button disabled on initial render', () => {
    const submitBtn = getElement<HTMLInputElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(true);
  });

  test('Submit button disabled if input does not match title', () => {
    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = wrongTitle;
    handleDeleteItemInput(itemTitle);

    const submitBtn = getElement<HTMLInputElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(true);
  });

  test('Submit button enabled if input is title', () => {
    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = itemTitle;
    handleDeleteItemInput(itemTitle);

    const submitBtn = getElement<HTMLInputElement>(`#${submitBtnId}`);
    expect(submitBtn.disabled).toBe(false);
  });
})
