import { JSX, ReactElement } from 'jsx-dom';
import getElement from '@/lib/utils/getElement';

// FIX ME getting this working and implement it in tagManager and pathManager

export default function Autocomplete(
  {
    key,
    generator,
    ...inputProps
  }: {
    key: string,
    generator: () => ReactElement,
  } & JSX.IntrinsicElements['input']
) {
  console.log(inputProps)
  const autocompleteId = `autocomplete-${key}`;
  const loadingText = 'Loading...';

  // const hideAutocomplete = [ 'hidden' ];
  // const showAutocomplete = [ 'flex' ];

  const classes = {
    hide: [ 'hidden' ],
    show: [ 'flex' ],
  }

  return (
    <div className='relative'
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
        onInput={() => {
          const children = generator();
          const container = getElement(`${autocompleteId}`);
          if (children.childElementCount) {
            container.replaceChildren(generator());
          } else {
            container.replaceChildren(loadingText);
          }
        }}
      />
      <div className={`absolute flex-col gap-2 bg-bg w-full text-center z-10 my-2 defaultBorder overflow-y-auto ${classes.hide.join(' ')}`}
        id={autocompleteId}
      >{loadingText}</div>
    </div>
  )
}
