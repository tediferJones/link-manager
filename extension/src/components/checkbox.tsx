import { Check } from 'lucide';
import Icon from '@/components/icon';
import getElement from '@/lib/utils/getElement';

export default function Checkbox(
  {
    id,
    onChange,
    checked,
  }: {
    id: string,
    onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void,
    checked: boolean,
  }
) {
  const checkedElement = <Icon name={Check} />
  return (
    <>
      <div className='h-6 w-6 defaultBorder flex items-center justify-center'
        onClick={(e) => {
          const checkboxInput = getElement<HTMLInputElement>(`#${id}`)
          if (e.currentTarget.childElementCount) {
            e.currentTarget.innerHTML = '';
            checkboxInput.checked = false;
          } else {
            e.currentTarget.appendChild(checkedElement);
            checkboxInput.checked = true;
          }
          const changeEvent = new Event('change', { bubbles: true });
          checkboxInput.dispatchEvent(changeEvent);
        }}
      >{checked && checkedElement}</div>
      <input className='hidden'
        id={id}
        type='checkbox'
        checked={checked}
        onChange={onChange}
      />
    </>
  )
}
