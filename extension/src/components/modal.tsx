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

export function openModal(title: string, element: Element) {
  getElement<HTMLDivElement>('#modalTitle').innerText = title;
  const content = getElement('#modalContent')
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
  getElement<HTMLDivElement>('#modalTitle').innerText = '';
  const content = getElement('#modalContent')
  content.innerHTML = '';
  content.classList.remove('pr-2');

  const container = getElement('#modalContainer');
  container.classList.remove(...openClasses);
  container.classList.add(...closedClasses);

  removeEventListener('keydown', handleKeyDown);
  enableHotKeys();
}

export function Modal() {
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex justify-center items-center backdrop-blur-lg ${closedClasses.join(' ')}`}
      id='modalContainer'
      onClick={closeModal}
    >
      <div className='relative m-auto defaultBorder flex flex-col gap-4 bg-bg max-w-[90vw] max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-between gap-4'>
          {/* FIX ME title is not actually centered, it is offset by the X button */}
          <div className='flex-1 m-auto text-center font-semibold'
            id='modalTitle'
          ></div>
          <button className='defaultBorder'
            onClick={closeModal}
          >
            <Icon name={X} />
          </button>
        </div>
        <hr />
        <div className='overflow-y-auto' id='modalContent'></div>
      </div>
    </div>
  )
}
