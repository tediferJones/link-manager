import { Input } from '@/components/ui';
import getElement from '@/lib/utils/getElement';
import { EventHandler, JSXElement, OptPromise } from '@/types';

// FIX ME move to constants folder (if we ended up choosing that route)
export const classes = {
  hide: [ 'hidden' ],
  show: [ 'flex' ],
}

export default function Autocomplete(
  {
    direction = 'auto',
    generator,
    onSubmit,
    containerClassName,
    boundingId,
    id,
    onFocus,
    onInput,
    ...inputProps
  }: {
    id: string,
    generator: (e: EventHandler<HTMLInputElement>) => OptPromise<string[]>,
    onSubmit: (e: EventHandler<HTMLFormElement>) => OptPromise<void>,
    direction?: 'top' | 'bottom' | 'auto',
    boundingId?: string,
    containerClassName?: string,
    onFocus?: (e: EventHandler<HTMLInputElement>) => OptPromise<void>,
    onInput?: (e: EventHandler<HTMLInputElement>) => OptPromise<void>,
  } & JSXElement<'input'>
) {
  const autocompleteId = `autocomplete-${id}`;

  // FIX ME does this belong in @/effects?
  // maybe not because it depends on forming a closure around the generator function
  // or make a function that will take generator function as an argument and return a getResults function
  async function getResults(e: Event & { currentTarget: HTMLInputElement }) {
    const children = await generator(e);
    const container = getElement(`#${autocompleteId}`);
    if (children.length) {
      container.replaceChildren(
        ...children.filter(Boolean).map((value, i) => (
          <>
            {i > 0 && <hr />}
            <button className='overflow-x-clip overflow-ellipsis'
              title={value}
              onClick={(e) => {
              const input = getElement<HTMLInputElement>(`#${id}`);
              input.value = e.currentTarget.textContent!;
            }}
            >{value}</button>
          </>
        ))
      );
    } else {
      container.replaceChildren('No Results');
    }
    setContainer();
  }

  // FIX ME optional
  //  - autocomplete container should react to scrolling (flip direction, change height, etc...)
  function setContainer() {
    if (!boundingId) return;
    const heightPadding = 24;
    const inputRect = getElement(`#${id}`).getBoundingClientRect();
    const modalContentRect = getElement(`#${boundingId}`).getBoundingClientRect();
    if (!modalContentRect) return;
    const container = getElement<HTMLDivElement>(`#${autocompleteId}`);
    
    const spaceBelow = modalContentRect.bottom - inputRect.bottom;
    const spaceAbove = inputRect.top - modalContentRect.top;
    let tempDirection = direction;
    if (tempDirection === 'auto') {
      tempDirection = spaceAbove > spaceBelow ? 'top' : 'bottom';
    };
    
    const positionClasses = {
      top: (container: HTMLDivElement) => {
        container.classList.remove('top-full');
        container.classList.add('bottom-full');
        container.style.maxHeight = `${spaceAbove - heightPadding}px`;
      },
      bottom: (container: HTMLDivElement) => {
        container.classList.remove('bottom-full');
        container.classList.add('top-full');
        container.style.maxHeight = `${spaceBelow - heightPadding}px`;
      },
    }
    positionClasses[tempDirection](container);
  }

  return (
    <form className={`relative ${containerClassName || ''}`}
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.currentTarget;
        await onSubmit(e);
        const input = getElement<HTMLInputElement>(`#${id}`)
        input.dispatchEvent(new Event('input', { bubbles: true }));
        form.dispatchEvent(new Event('autocompleteSubmit', { bubbles: true }));
        input.focus();
      }}
      onBlurCapture={(e) => {
        const next = e.relatedTarget;
        if (!(next instanceof Node && e.currentTarget.contains(next))) {
          const pathAutocomplete = getElement(`#${autocompleteId}`);
          pathAutocomplete.classList.add(...classes.hide);
          pathAutocomplete.classList.remove(...classes.show);
        }
      }}
    >
      <Input className='w-full'
        id={id}
        required
        onFocus={(e) => {
          onFocus?.(e);
          getResults(e);
          const container = getElement(`#${autocompleteId}`);
          container.classList.remove(...classes.hide);
          container.classList.add(...classes.show);
        }}
        onInput={(e) => {
          onInput?.(e);
          getResults(e);
        }}
        {...inputProps}
      />
      <div className={`absolute flex-col gap-2 bg-bg w-full text-center z-10 my-2 defaultBorder overflow-y-auto ${classes.hide.join(' ')}`}
        id={autocompleteId}
      >Loading...</div>
    </form>
  )
}
