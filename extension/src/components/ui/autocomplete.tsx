import { Input } from '@/components/ui';
import getElement from '@/lib/utils/getElement';
import { EventHandler, JSXElement, OptPromise } from '@/types';

// FIX ME getting this working and implement it in tagManager and pathManager
// FIX ME write tests for this component
// FIX ME make sure autocomplete container does not overflow screen when too many options are present
//  - see pathManager for example logic
//  - add prop for choosing if autocomplete container should go above or below input
//    - or auto (automatically chose side with most space)
//    - container height should respond to scrolling
//  - if autocomplete contents is taller than container add a scollbar
// FIX ME make a generic event type like MyEvent<HTMLElement>
//  - would simplify all these Event & { currentTarget: Element } types
//  - while we're at it maybe make a generic ElementProps type 
//    - essentially just JSX.IntrinsicElements[T]

// Logic for preventing results overflowing screen
// function updatePathAutocomplete(
//   {
//     path,
//     item
//   }: {
//     path: string[],
//     item: Content
//   }
// ) {
//   const pathAutocomplete = getElement<HTMLDivElement>('#pathAutocomplete');
//   pathAutocomplete.innerHTML = '';
//   pathAutocomplete.appendChild(<PathAutocomplete path={path} item={item} />);
// 
//   // FIX ME apply this height limiting stuff to tagManager
//   const pathInputRect = getElement('#pathInput').getBoundingClientRect();
//   const modalContentRect = getElement('#modalContent').getBoundingClientRect();
//   const spaceBelow = modalContentRect.bottom - pathInputRect.bottom;
//   pathAutocomplete.style.maxHeight = `${spaceBelow - 8}px`;
//   // FIX ME do we want autocomplete to ever be on top?
//   // if so it will cover path display
//   // const spaceAbove = pathInputRect.top - modalContentRect.top;
//   // if (spaceAbove > spaceBelow) {
//   //   console.log('render on top')
//   //   pathAutocomplete.classList.remove('top-full');
//   //   pathAutocomplete.classList.add('bottom-full');
//   //   pathAutocomplete.style.maxHeight = `${spaceAbove - 8}px`;
//   // } else {
//   //   console.log('render on bottom')
//   //   pathAutocomplete.classList.remove('bottom-full');
//   //   pathAutocomplete.classList.add('top-full');
//   //   pathAutocomplete.style.maxHeight = `${spaceBelow - 8}px`;
//   // }
// }

export default function Autocomplete(
  {
    generator,
    onSubmit,
    containerClassName,
    id,
    onFocus,
    onInput,
    ...inputProps
  }: {
    generator: (e: EventHandler<HTMLInputElement>) => OptPromise<string[]>,
    onSubmit: (e: EventHandler<HTMLFormElement>) => OptPromise<void>,
    onFocus?: (e: EventHandler<HTMLInputElement>) => OptPromise<void>,
    onInput?: (e: EventHandler<HTMLInputElement>) => OptPromise<void>,
    containerClassName?: string,
    id: string,
  } & JSXElement<'input'>
) {
  const autocompleteId = `autocomplete-${id}`;

  const classes = {
    hide: [ 'hidden' ],
    show: [ 'flex' ],
  }

  // FIX ME does this belong in @/effects?
  // maybe not because it depends on forming a closure around the generator function
  // or make a function that will take generator function as an argument and return a getResults function
  async function getResults(e: Event & { currentTarget: HTMLInputElement }) {
    const children = await generator(e);
    const container = getElement(`#${autocompleteId}`);
    if (children.length) {
      container.replaceChildren(
        ...children.filter(Boolean).map((tagElement, i) => (
          <>
            {i > 0 && <hr />}
            <button onClick={(e) => {
              const input = getElement<HTMLInputElement>(`#${id}`);
              input.value = e.currentTarget.textContent!;
            }}
            >{tagElement}</button>
          </>
        ))
      );
    } else {
      container.replaceChildren('No Results');
    }
  }

  return (
    <form className={`relative ${containerClassName || ''}`}
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // FIX ME, make sure tagEditor still works as expected
        // const formParent = e.currentTarget.parentElement;
        await onSubmit(e);
        getElement(`#${id}`).dispatchEvent(
          new Event('input', { bubbles: true })
        );
        // if (formParent) formParent.dispatchEvent(e);
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
