import { beforeEach, describe, expect, test } from 'vitest';
import { Modal } from '@/components/layout';
import {
  closedClasses,
  modalContainerId,
  openClasses
} from '@/components/layout/modal';
import { closeModal, openModal } from '@/effects/modal';
import getElement from '@/lib/utils/getElement';

// FIX ME write more tests

describe('Open modal', () => {
  beforeEach(() => document.body.appendChild(<Modal />))

  test('Show modal', () => {
    openModal('testTitle', <div>test element</div>);
    const container = getElement(`#${modalContainerId}`);
    openClasses.forEach(className => {
      expect(container.className).toContain(className)
    });
  });
});

describe('Close modal', () => {
  beforeEach(() => document.body.appendChild(<Modal />))

  test('Hide modal', () => {
    closeModal();
    const container = getElement(`#${modalContainerId}`);
    closedClasses.forEach(className => {
      expect(container.className).toContain(className)
    });
  });
});
