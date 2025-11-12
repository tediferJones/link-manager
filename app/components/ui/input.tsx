import { X } from 'lucide';
import { Icon } from '@/app/components/ui';
import { inline } from '@/app/lib/app/buttonToggleClasses';
import getElement from '@/app/lib/utils/getElement';
import { EventHandler, JSXElement, OptPromise } from '@/app/types';

// FIX ME write tests for this component
// FIX ME is this component even really necessary?
// all it does is add an X button for clearing the content
// makes navigating via tab trickier
// also breaks autocomplete refocusing input after selection

// FIX ME move to constants
export const classes = {
  show: [ 'opacity-100', 'pointer-events-auto' ],
  hide: [ 'opacity-0', 'pointer-events-none' ],
}

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
  const clearBtnId = `input-${id}-clear`;

  return (
    // FIX ME apply focus-within:ring class
    // container should display ring when either the input or the button is focused
    <div className='border flex gap-2'
      onFocusCapture={() => {
        const clearBtn = getElement(`#${clearBtnId}`);
        clearBtn.classList.add(...classes.show);
        clearBtn.classList.remove(...classes.hide);
      }}
      onBlurCapture={() => {
        const clearBtn = getElement(`#${clearBtnId}`);
        clearBtn.classList.add(...classes.hide);
        clearBtn.classList.remove(...classes.show);
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
      <button className={`${classes.hide.join(' ')} ${inline('animate')}`}
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
