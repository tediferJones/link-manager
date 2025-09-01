import { LoaderCircle } from 'lucide';
import Icon from '@/components/icon';

export default function Loading() {
  return (
    <div className='flex justify-center gap-4 p-4'>
      <span>Loading</span>
      <div className='animate-spin'>
        <Icon name={LoaderCircle} />
      </div>
    </div>
  )
}
