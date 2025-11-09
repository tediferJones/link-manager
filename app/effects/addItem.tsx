import { Folder, Link2 } from 'lucide';
import { Icon } from '@/components/ui';
import {
  hrefInputId,
  submitBtnId,
  titleInputId,
} from '@/components/forms/addItem';
import getElement from '@/lib/utils/getElement';

// FIX ME consider moving to its own file
// we have other components so could apply to other files
// maybe @/lib/constants/classes.ts
export const disabledBtnClasses = [ '!cursor-not-allowed', 'opacity-50' ];

export function handleAddItemInput() {
  const titleElement = getElement<HTMLInputElement>(`#${titleInputId}`);
  titleElement.setCustomValidity('');
  const title = titleElement.value;
  const hrefElement = getElement<HTMLInputElement>(`#${hrefInputId}`);
  hrefElement.setCustomValidity('');
  const href = hrefElement.value;
  const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);

  if (title && href) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(
      <span className='flex gap-2 justify-center'>
        <Icon name={Link2} />
        <span>Add Link</span>
      </span>
    )
    submitBtn.disabled = false;
    submitBtn.classList.remove(...disabledBtnClasses);
  } else if (title) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(
      <span className='flex gap-2 justify-center'>
        <Icon name={Folder} />
        <span>Add Folder</span>
      </span>
    )
    submitBtn.disabled = false;
    submitBtn.classList.remove(...disabledBtnClasses);
  } else {
    submitBtn.innerText = 'Add';
    submitBtn.disabled = true;
    submitBtn.classList.add(...disabledBtnClasses);
  }
}
