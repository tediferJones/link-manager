import {
  closedClasses,
  openClasses,
  modalContentId,
  modalTitleId,
  modalContainerId,
} from '@/components/layout/modal';
import { disableHotKeys, enableHotKeys } from '@/lib/app/hotkeys';
import getElement from '@/lib/utils/getElement';

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
  }
}

// FIX ME trap focus within modal when opened
// FIX ME pressing escape on a focused input does not cause it to lose focus
// FIX ME write tests
export function openModal(title: string, element: Element) {
  getElement<HTMLDivElement>(`#${modalTitleId}`).innerText = title;
  const content = getElement(`#${modalContentId}`);
  content.appendChild(element);

  const container = getElement(`#${modalContainerId}`);
  container.classList.remove(...closedClasses);
  container.classList.add(...openClasses);

  addEventListener('keydown', handleKeyDown);
  disableHotKeys();

  setTimeout(() => {
    if (content.scrollHeight > content.clientHeight) {
      content.classList.add('pr-2');
    }
  });
}

export function closeModal() {
  // FIX ME extract animation duration to constants
  // maybe create a duration/animate class to match duration value
  setTimeout(() => {
    getElement<HTMLDivElement>(`#${modalTitleId}`).innerText = '';
    const content = getElement(`#${modalContentId}`);
    content.innerHTML = '';
    content.classList.remove('pr-2');
  }, 300 /* same as animation duration */);

  const container = getElement(`#${modalContainerId}`);
  container.classList.remove(...openClasses);
  container.classList.add(...closedClasses);

  removeEventListener('keydown', handleKeyDown);
  enableHotKeys();
}
