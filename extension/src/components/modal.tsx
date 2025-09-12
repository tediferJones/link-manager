import { X } from 'lucide';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';
import { disableHotKeys, enableHotKeys } from '@/lib/hotkeys';

const openClasses = ['pointer-events-auto', 'opacity-100'];
const closedClasses = ['pointer-events-none', 'opacity-0'];

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
  }
}

// FIX ME, trap focus within modal when opened
export function openModal(title: string, element: Element) {
  getElement<HTMLDivElement>('#modalTitle').innerText = title;
  const content = getElement('#modalContent');
  content.appendChild(element);

  const container = getElement('#modalContainer');
  container.classList.remove(...closedClasses);
  container.classList.add(...openClasses);
  
  addEventListener('keydown', handleKeyDown);
  disableHotKeys();

  setTimeout(() => {
    if (content.scrollHeight > content.clientHeight) {
      content.classList.add('pr-2');
    }
  });
}

export function closeModal() {
  setTimeout(() => {
    getElement<HTMLDivElement>('#modalTitle').innerText = '';
    const content = getElement('#modalContent');
    content.innerHTML = '';
    content.classList.remove('pr-2');
  }, 300 /* same as animation duration */);

  const container = getElement('#modalContainer');
  container.classList.remove(...openClasses);
  container.classList.add(...closedClasses);

  removeEventListener('keydown', handleKeyDown);
  enableHotKeys();
}

export function Modal() {
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex justify-center items-center transition-all duration-300 backdrop-blur-lg ${closedClasses.join(' ')}`}
      id='modalContainer'
      onClick={closeModal}
    >
      <div className='relative m-auto defaultBorder flex flex-col gap-4 bg-bg max-w-[90vw] max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-between gap-4 relative'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold'
            id='modalTitle'
          ></div>
          <button className='defaultBorder ml-auto'
            onClick={closeModal}
          >
            <Icon name={X} />
          </button>
        </div>
        <hr />
        {/* FIX ME overflow-y-auto causes input outlines to be cut off when focused */}
        <div className='overflow-y-auto' id='modalContent'></div>
      </div>
    </div>
  )
}
