import { describe, expect, test, vi } from 'vitest';
import { DeleteItem } from '@/app/components/forms';
import { titleInputId } from '@/app/components/forms/deleteItem';
import { deleteItem } from '@/app/lib/newVault/core';
import { newUserVault } from '@/app/lib/app/userVault';
import getElement from '@/app/lib/utils/getElement';
import { mockItem } from '@/app/lib/test/mockItems';
import { Result } from '@/app/types';

vi.mock('@/app/effects', () => ({ closeModal: vi.fn() }));
vi.mock('@/app/lib/newVault/core', () => ({ deleteItem: vi.fn() }));

describe('Delete item', () => {
  const itemTitle = 'title1';
  const item = mockItem('link', itemTitle);

  test('Fail to submit when input is empty', () => {
    const form = <DeleteItem item={item} />
    document.body.appendChild(form);

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(deleteItem).not.toHaveBeenCalled();
  });

  test('Fail to submit if input does not match item title', () => {
    const form = <DeleteItem item={item} />
    document.body.appendChild(form);

    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = 'wrongTitle';

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(deleteItem).not.toHaveBeenCalled();
  });

  test('Submit if input matches item title', () => {
    if (!vi.isMockFunction(deleteItem)) {
      throw Error('deleteItem is not mocked');
    }
    deleteItem.mockResolvedValueOnce({
      success: true,
      data: {},
    } as Result<any>);

    const form = <DeleteItem item={item} />
    document.body.appendChild(form);

    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = itemTitle;

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);
    
    expect(deleteItem).toHaveBeenCalledExactlyOnceWith(
      newUserVault.root,
      newUserVault.path.concat(itemTitle),
    );
  });
});
