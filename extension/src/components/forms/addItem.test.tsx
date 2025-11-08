import { describe, test, beforeEach, expect, vi } from 'vitest';
import { AddItem } from '@/components/forms';
import { hrefInputId, titleInputId } from '@/components/forms/addItem';
import { closeModal } from '@/effects/modal';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';
import { addItem } from '@/lib/newVault/core';
import { getNewSortedKeys } from '@/lib/newVault/utils';
import { newUserVault } from '@/lib/app/userVault';

// FIX ME do not import form @/effects, unless you want to mock everything that gets exported
vi.mock('@/effects/modal', () => ({ closeModal: vi.fn() }));
vi.mock('@/lib/newVault/core', () => ({ addItem: vi.fn() }))

describe('Add item', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('Fail to submit if title not filled out', () => {
    const form = <AddItem />;
    document.body.append(form);

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(addItem).not.toHaveBeenCalled();
  });

  test('Adds folder if only title is filled out', () => {
    const form = <AddItem />;
    document.body.append(form);

    const title = 'folder1';
    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    titleInput.value = title;

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(addItem).toHaveBeenCalledWith(
      newUserVault.root,
      newUserVault.path,
      expect.objectContaining({
        type: 'folder',
        title,
        contents: {},
        sortedKeys: getNewSortedKeys(),
        tags: [],
        pinned: false,
      } as Omit<Content<'folder'>, 'date'>)
    );

    expect(closeModal).toHaveBeenCalled();
  });

  test('Adds link if both title and href are filled out', () => {
    const form = <AddItem />;
    document.body.append(form);

    const title = 'link1';
    const href = 'https://example.com';
    const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
    const hrefInput = getElement<HTMLInputElement>(`#${hrefInputId}`);
    titleInput.value = title;
    hrefInput.value = href;

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

    expect(addItem).toHaveBeenCalledWith(
      newUserVault.root,
      newUserVault.path,
      expect.objectContaining({
        type: 'link',
        title,
        href,
        tags: [],
        pinned: false,
      } as Omit<Content<'link'>, 'date'>)
    );

    expect(closeModal).toHaveBeenCalled();
  });
});
