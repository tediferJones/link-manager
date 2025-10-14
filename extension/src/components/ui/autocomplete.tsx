import { JSX } from 'jsx-dom';
import getElement from '@/lib/utils/getElement';

// FIX ME getting this working and implement it in tagManager and pathManager
// FIX ME write tests for this component
// FIX ME make sure autocomplete container does not overflow screen when too many options are present
//  - see pathManager for example logic
// FIX ME make a generic event type like MyEvent<HTMLElement>
//  - would simplify all these Event & { currentTarget: Element } types
//  - while we're at it maybe make a generic ElementProps type 
//    - essentially just JSX.IntrinsicElements[T]

export default function Autocomplete(
  {
    generator,
    onSubmit,
    containerClassName,
    id,
    ...inputProps
  }: {
    generator: (e: Event & { currentTarget: HTMLInputElement }) => Promise<string[]>,
    onSubmit: (e: Event & { currentTarget: HTMLFormElement }) => Promise<void>,
    containerClassName: string,
  } & JSX.IntrinsicElements['input']
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
    <form className={`relative ${containerClassName}`}
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const formParent = e.currentTarget.parentElement;
        await onSubmit(e);
        getElement(`#${id}`).dispatchEvent(
          new Event('input', { bubbles: true })
        );
        if (formParent) formParent.dispatchEvent(e);
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
      <input className='defaultBorder w-full'
        id={id}
        required
        // FIX ME how do we want to handle input props that overlap the ones we already have defined?
        onFocus={(e) => {
          getResults(e);
          const container = getElement(`#${autocompleteId}`);
          container.classList.remove(...classes.hide);
          container.classList.add(...classes.show);
        }}
        onInput={getResults}
        {...inputProps}
      />
      <div className={`absolute flex-col gap-2 bg-bg w-full text-center z-10 my-2 defaultBorder overflow-y-auto ${classes.hide.join(' ')}`}
        id={autocompleteId}
      >Loading...</div>
    </form>
  )
}
