import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Modal } from '@/components/layout';
import {
  closedClasses,
  modalContainerId,
  modalContentId,
  modalTitleId,
  openClasses
} from '@/components/layout/modal';
import { closeModal, openModal } from '@/effects/modal';
import getElement from '@/lib/utils/getElement';
import { disableHotKeys, enableHotKeys } from '@/lib/app/hotkeys';

// FIX ME write more tests
const title = 'testTitle';
const content = <div>test element</div>;

vi.mock('@/lib/app/hotkeys', () => ({
  enableHotKeys: vi.fn(),
  disableHotKeys: vi.fn(),
}));

describe('Open modal', () => {
  beforeEach(() => document.body.appendChild(<Modal />));

  test('Switches classes to show modal', () => {
    openModal(title, content);
    const container = getElement(`#${modalContainerId}`);
    openClasses.forEach(className => {
      expect(container.className).toContain(className);
    });
    closedClasses.forEach(className => {
      expect(container.className).not.toContain(className);
    })
  });

  test('Displays title', () => {
    openModal(title, content);
    const titleElement = getElement(`#${modalTitleId}`);
    expect(titleElement.textContent).toBe(title);
  });

  test('Displays content', () => {
    openModal(title, content);
    const contentElement = getElement(`#${modalContentId}`);
    expect(contentElement.contains(content)).toBe(true);
  });

  test('Disables hotkeys', () => {
    openModal(title, content);
    expect(disableHotKeys).toHaveBeenCalledOnce();
  });
});

describe('Close modal', () => {
  beforeEach(() => document.body.appendChild(<Modal />));

  test('Switches classes to hide modal', () => {
    openModal(title, content);
    closeModal();
    const container = getElement(`#${modalContainerId}`);
    openClasses.forEach(className => {
      expect(container.className).not.toContain(className);
    });
    closedClasses.forEach(className => {
      expect(container.className).toContain(className);
    });
  });

  test('Clears title and content', () => {
    openModal(title, content);
    closeModal();
    setTimeout(() => {
      expect(getElement(`#${modalTitleId}`).textContent).toBe('');
      expect(getElement(`#${modalContentId}`).innerHTML).toBe('');
    }, 300);
  });

  test('Re-enables hotkeys', () => {
    openModal(title, content);
    closeModal();
    expect(enableHotKeys).toHaveBeenCalledOnce();
  });
});
