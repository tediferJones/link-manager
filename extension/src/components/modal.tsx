import { X } from 'lucide';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';

const openClasses = ['pointer-events-auto', 'opacity-100'];
const closedClasses = ['pointer-events-none', 'opacity-0'];

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal();
}

export function openModal(title: string, element: Element) {
  getElement<HTMLDivElement>('#modalTitle').innerText = title;
  getElement('#modalContent').appendChild(element);

  const container = getElement('#modalContainer');
  closedClasses.forEach(className => container.classList.remove(className));
  openClasses.forEach(className => container.classList.add(className));
  
  addEventListener('keydown', handleKeyDown);
}

export function closeModal() {
  getElement<HTMLDivElement>('#modalTitle').innerText = '';
  getElement('#modalContent').innerHTML = '';

  const container = getElement('#modalContainer');
  closedClasses.forEach(className => container.classList.add(className));
  openClasses.forEach(className => container.classList.remove(className));

  removeEventListener('keydown', handleKeyDown);
}

export function Modal() {
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex justify-center items-center backdrop-blur-lg ${closedClasses.join(' ')}`}
      id='modalContainer'
    >
      <div className='relative m-auto defaultBorder flex flex-col gap-4 bg-bg'
      >
        <div className='flex justify-between gap-4'>
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
        <div id='modalContent'></div>
      </div>
    </div>
  )
}
