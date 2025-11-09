import { LoaderCircle } from 'lucide';
import { Icon } from '@/components/ui';

export default function Loading({ loadingText }: { loadingText?: string }) {
  return (
    <div className='flex justify-center gap-4 p-4 m-auto'>
      <span>{loadingText || 'Loading'}</span>
      <Icon name={LoaderCircle} className='animate-spin' />
    </div>
  )
}
