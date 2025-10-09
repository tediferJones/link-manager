import { ReactElement } from 'jsx-dom';
import getElement from '@/lib/utils/getElement';

// FIX ME add focus trap when opened

export default function Dropdown(
  {
    key,
    align,
    children,
  }: {
    key: string,
    align: 'left' | 'right' | 'center',
    children: [ ReactElement, ReactElement ],
  }
) {
  const contentId = `${key}-dropdown`;

  const alignmentClasses = {
    left: [ 'left-0' ],
    right: [ 'right-0' ],
    center: [ 'left-1/2', '-translate-x-1/2' ],
  }[align];

  const toggleClasses = {
    open: [ 'opacity-100', 'pointer-events-auto' ],
    closed: [ 'opacity-0', 'pointer-events-none' ],
  }

  const contentClasses = [
    'absolute',
    'mt-2',
    'bg-bg',
    'z-10',
    'text-nowrap',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'defaultBorder',
  ].concat(alignmentClasses).concat(toggleClasses.closed);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') toggleVisibility();
  }

  function isOpen() {
    const dropdown = getElement<HTMLDivElement>(`#${contentId}`);
    return toggleClasses.open.some(
      className => dropdown.classList.contains(className)
    );
  }

  function toggleVisibility() {
    const dropdown = getElement<HTMLDivElement>(`#${contentId}`);
    if (isOpen()) {
      dropdown.classList.add(...toggleClasses.closed);
      dropdown.classList.remove(...toggleClasses.open);
      dropdown.setAttribute('inert', '');
      removeEventListener('keydown', handleKeydown);
    } else {
      dropdown.classList.add(...toggleClasses.open);
      dropdown.classList.remove(...toggleClasses.closed);
      dropdown.removeAttribute('inert');
      addEventListener('keydown', handleKeydown);
    }
  }

  const [ trigger, content ] = children;

  trigger.onclick = toggleVisibility;
  content.classList.add(...contentClasses);
  content.id = contentId;
  content.setAttribute('inert', '');

  return (
    <div className='relative'
      onBlurCapture={(e) => {
        if (!isOpen()) return;
        const next = e.relatedTarget;
        if (!(next instanceof Node && e.currentTarget.contains(next))) {
          toggleVisibility();
        }
      }}
    >
      {trigger}
      {content}
    </div>
  )
}
