import { X } from 'lucide';
import { Icon } from '@/app/components/ui';

export default function Tag(
  {
    value,
    xFunc,
  }: {
    value: string,
    xFunc?: (e: Event & { currentTarget: HTMLButtonElement }) => void,
  }
) {
  return (
    <span className='bg-fg text-bg py-1 px-2 rounded-lg flex gap-2'>
      {value}
      {xFunc && (
        <button onClick={xFunc}>
          <Icon name={X} />
        </button>
      )}
    </span>
  )
}
