import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DeleteItem } from '@/components/forms';
import { titleInputId } from '@/components/forms/deleteItem';
import UserVault from '@/lib/app/userVault';
import Result from '@/lib/vault/Result';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

vi.mock('@/components/modal', () => ({ closeModal: vi.fn() }));
vi.mock('@/lib/app/userVault', () => ({
  default: {
    delete: vi.fn().mockResolvedValue({
      throw: vi.fn(() => (Result.success(true)))
    }),
    path: [],
    getItemPath: vi.fn(),
  }
}));

describe('Delete item', () => {
  const itemTitle = 'title1';
  const item = { title: itemTitle } as Content<'link'>;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('Fail to submit when input is empty', () => {
    const form = <DeleteItem item={item} />
    document.body.appendChild(form);

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(UserVault.delete).not.toHaveBeenCalled();
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

    expect(UserVault.delete).not.toHaveBeenCalled();
  });

  test('Submit if input matches item title', () => {
    const form = <DeleteItem item={item} />
    document.body.appendChild(form);

    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = itemTitle;

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(UserVault.delete).toHaveBeenCalled();
  });
});
