import { X } from 'lucide';
import Icon from '@/components/ui/icon';
import { inline } from '@/lib/app/buttonToggleClasses';
import getElement from '@/lib/utils/getElement';
import { EventHandler, JSXElement, OptPromise } from '@/types';

// FIX ME write tests for this component
// FIX ME is this component even really necessary?
// all it does is add an X button for clearing the content
// makes navigating via tab trickier

export default function Input(
  {
    id,
    onKeyDown,
    className,
    ...inputProps
  }: {
    id: string,
    onKeyDown?: (e: EventHandler<HTMLInputElement, KeyboardEvent>) => OptPromise<void>,
  } & JSXElement<'input'>
) {
  const focusClasses = [ 'opacity-100' ];
  const blurClasses = [ 'opacity-0' ];
  const clearBtnId = `input-${id}-clear`;

  return (
    // FIX ME apply focus-within:ring class
    // container should display ring when either the input or the button is focused
    <div className='border flex gap-2'
      onFocusCapture={() => {
        const clearBtn = getElement(`#${clearBtnId}`);
        clearBtn.classList.add(...focusClasses);
        clearBtn.classList.remove(...blurClasses);
      }}
      onBlurCapture={() => {
        const clearBtn = getElement(`#${clearBtnId}`);
        clearBtn.classList.add(...blurClasses);
        clearBtn.classList.remove(...focusClasses);
      }}
    >
      <input className={`noFocus outline-none w-full ${className || ''}`}
        id={id}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === 'Escape') {
            e.currentTarget.blur();
            e.stopPropagation();
          }
        }} 
        {...inputProps}
      />
      <button className={`${blurClasses.join(' ')} ${inline('animate')}`}
        id={clearBtnId}
        type='button'
        onClick={() => {
          const input = getElement<HTMLInputElement>(`#${id}`);
          input.value = '';
          input.focus();
        }}
      >
        <Icon name={X} />
      </button>
    </div>
  )
}
