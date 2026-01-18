import { describe, expect, test, vi } from 'vitest';
import { Modal } from '@/components/layout';
import {
  closedClasses,
  modalCardId,
  modalCloseBtnId,
  modalContainerId,
  modalContentId,
  modalTitleId,
} from '@/components/layout/modal';
import { closeModal } from '@/effects';
import getElement from '@/lib/utils/getElement';

vi.mock('@/effects/modal', () => ({ closeModal: vi.fn() }));

describe('Modal', () => {
  test('Basic structure and hidden on initial render', () => {
    document.body.appendChild(<Modal />);
    expect(getElement(`#${modalTitleId}`)).toBeTruthy();
    expect(getElement(`#${modalContentId}`)).toBeTruthy();
    const container = getElement(`#${modalContainerId}`);
    expect(container).toBeTruthy();
    closedClasses.forEach(className => {
      expect(container.className).toContain(className);
    });
  });

  test('Call closeModal when backdrop clicked', () => {
    document.body.appendChild(<Modal />);
    getElement<HTMLDivElement>(`#${modalContainerId}`).click();
    expect(closeModal).toHaveBeenCalledOnce();
  });

  test('Stays open when clicked inside content', () => {
    document.body.appendChild(<Modal />);
    getElement<HTMLDivElement>(`#${modalCardId}`).click();
    expect(closeModal).not.toHaveBeenCalled();
  });

  test('Call closeModal when close button clicked', () => {
    document.body.appendChild(<Modal />);
    getElement<HTMLDivElement>(`#${modalCloseBtnId}`).click();
    expect(closeModal).toHaveBeenCalledOnce();
  });
});
