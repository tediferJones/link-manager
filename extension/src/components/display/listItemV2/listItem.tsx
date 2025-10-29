import { Settings2 } from 'lucide';
import {
  ListItemWrapper,
  ListItemCore,
  ListItemDetails,
} from '@/components/display/listItemV2'
import { ItemSettings } from '@/components/display';
import { Icon } from '@/components/ui';
import { openModal } from '@/effects';
import { Content, ContentTypes } from '@/types';

// FIX ME move to types file
type ItemClasses = { [K in ContentTypes]: string }

export default function ListItem({ item }: { item: Content }) {
  const itemClasses: ItemClasses = {
    link: 'bg-fg text-bg',
    watched: 'bg-fg text-bg opacity-50',
    folder: '',
    encryptedFolder: '',
  }

  const type = item.type[0].toUpperCase() + item.type.slice(1);

  return (
    <div className={`flex gap-4 defaultBorder ${itemClasses[item.type]}`}>
      <ListItemWrapper item={item}>
        <ListItemCore item={item} />
      </ListItemWrapper>
      <ListItemDetails item={item} />
      <button title={`${type} Settings: ${item.title}`}
        onClick={() => {
          openModal(`${type} Settings`, <ItemSettings item={item} />)
        }}>
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
