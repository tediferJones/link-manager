import getElement from '@/lib/utils/getElement';

export function showError(id: string, msg: string) {
  const container = getElement(`#${id}`);
  container.textContent = msg;
  container.classList.remove('hidden');
}

export function hideError(id: string) {
  const container = getElement(`#${id}`);
  container.classList.add('hidden');
  container.textContent = '';
}

export default function ErrorMsg({ id }: { id: string }) {
  return (
    <div className='text-red-500 font-semibold m-auto hidden col-span-full'
      id={id}
    ></div>
  )
}
