import { X } from 'lucide';
import { Icon } from '@/components/ui';
import { closeModal } from '@/effects';

// FIX ME move to constants
export const openClasses = [ 'pointer-events-auto', 'opacity-100' ];
export const closedClasses = [ 'pointer-events-none', 'opacity-0' ];
export const modalContainerId = 'modalContainer';
export const modalTitleId = 'modalTitle';
export const modalContentId = 'modalContent';

// FIX ME write tests
export default function Modal() {
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex justify-center items-center transition-all duration-300 backdrop-blur-lg ${closedClasses.join(' ')}`}
      id={modalContainerId}
      onClick={closeModal}
    >
      <div className='relative m-auto defaultBorder flex flex-col gap-4 bg-bg max-w-[90vw] max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative flex items-center gap-4'>
          <div className='absolute left-1/2 -translate-x-1/2 font-semibold text-nowrap'
            id={modalTitleId}
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
        <div className='overflow-y-auto p-2' id={modalContentId}></div>
      </div>
    </div>
  )
}
