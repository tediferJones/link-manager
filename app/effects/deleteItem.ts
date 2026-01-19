import { submitBtnId, titleInputId } from '@/app/components/forms/deleteItem';
import { btnClassNames } from '@/app/lib/app/buttonToggleClasses';
import getElement from '@/app/lib/utils/getElement';

const { enabled, disabled } = btnClassNames;

export function handleDeleteItemInput(title: string) {
  const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
  const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
  const match = titleInput.value === title;
  if (match) {
    submitBtn.disabled = false;
    submitBtn.classList.remove(...disabled);
    submitBtn.classList.add(...enabled);
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove(...enabled);
    submitBtn.classList.add(...disabled);
  }
}
