import { ChevronLeft, X } from 'lucide';
import { Icon } from '@/components/ui';
import getElement from '@/lib/utils/getElement';
import { disableHotKeys, enableHotKeys } from '@/lib/app/hotkeys';

const openClasses = [ 'pointer-events-auto', 'opacity-100' ];
const closedClasses = [ 'pointer-events-none', 'opacity-0' ];

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
  }
}

// FIX ME, trap focus within modal when opened
export function openModal(title: string, element: Element, back?: { title: string, element: Element }) {
  getElement<HTMLDivElement>('#modalTitle').innerText = title;
  const content = getElement('#modalContent');
  content.appendChild(element);

  const container = getElement('#modalContainer');
  container.classList.remove(...closedClasses);
  container.classList.add(...openClasses);

  const backBtn = getElement<HTMLButtonElement>('#modalBackBtn');
  if (back) {
    backBtn.classList.add(...openClasses);
    backBtn.classList.remove(...closedClasses);
    backBtn.onclick = () => {
      clearModal();
      openModal(back.title, back.element);
    }
  } else {
    backBtn.classList.add(...closedClasses);
    backBtn.classList.remove(...openClasses);
  }
  
  addEventListener('keydown', handleKeyDown);
  disableHotKeys();

  setTimeout(() => {
    if (content.scrollHeight > content.clientHeight) {
      content.classList.add('pr-2');
    }
  });
}

export function closeModal() {
  setTimeout(() => clearModal(), 300 /* same as animation duration */);

  const container = getElement('#modalContainer');
  container.classList.remove(...openClasses);
  container.classList.add(...closedClasses);

  removeEventListener('keydown', handleKeyDown);
  enableHotKeys();
}

export function clearModal() {
  getElement<HTMLDivElement>('#modalTitle').innerText = '';
  const content = getElement('#modalContent');
  content.innerHTML = '';
  content.classList.remove('pr-2');
}

export function navigateModal(
  title: string,
  element: Element,
  back?: { title: string, element: Element },
) {
  clearModal();
  openModal(title, element, back);
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
        <div className='flex justify-between items-center gap-4'>
          <button className={`defaultBorder mr-auto transition-all duration-300 ${closedClasses.join(' ')}`}
            title='Back'
            id='modalBackBtn'
          >
            <Icon name={ChevronLeft} />
          </button>
          <div className='font-semibold text-nowrap'
            id='modalTitle'
          ></div>
          <button className='defaultBorder ml-auto'
            title='Close'
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
