import {
  ChevronDown,
  ChevronUp,
  Eye,
  Folder,
  FolderKey,
  FolderLock,
  IconNode,
  Link2,
  Lock,
  Pin,
  Settings2,
} from 'lucide';
import { ReactNode } from 'jsx-dom';
import { ItemSettings } from '@/components/display';
import { Icon } from '@/components/ui';
import { openModal } from '@/effects';
import UserVault from '@/lib/app/userVault';
import { Content, ContentTypes } from '@/types'

// FIX ME replace ReactElement types with ReactNode
//  - ReactNode is superset of ReactElement

type ItemIcon = {
  [K in ContentTypes]: (item: Content<K>) => IconNode
}
function ListItemCore<T extends ContentTypes>(
  {
    item,
  }: {
    item: Content<T>,
  }
) {
  const itemIcon: ItemIcon = {
    link: () => Link2,
    watched: () => Link2,
    folder: (item) => item.encryption ? FolderKey : Folder,
    encryptedFolder: () => FolderLock,
  };

  return (
    <>
      {item.pinned && <Icon name={Pin} className='stroke-green-500' />}
      <Icon name={itemIcon[item.type](item)} />
      <span className='truncate'>{item.title}</span>
    </>
  )
}

type ItemWrapper = {
  [K in ContentTypes]: (
    item: Content<K>,
    children: ReactNode,
    className: string,
  ) => ReactNode
}
function ListItemWrapper<T extends ContentTypes>(
  {
    item,
    children,
  }: {
    item: Content<T>,
    children: ReactNode,
  }
) {
  const itemWrapper: ItemWrapper = {
    link: (item, children, className) => (
      <a className={className}
        title={`Go to: ${item.href}`} href={item.href}
      >{children}</a>
    ),
    watched: (item, children, className) => (
      <a className={className}
        title={`Go to: ${item.href}`} href={item.href}
      >{children}</a>
    ),
    folder: (item, children, className) => (
      <button className={className}
        title={`Enter folder: ${item.title}`}
        onClick={() => UserVault.setDir(UserVault.getItemPath(item))}
      >{children}</button>
    ),
    encryptedFolder: (item, children, className) => (
      <button className={className}
        title={`Enter encrypted folder: ${item.title}`}
        onClick={() => UserVault.setDir(UserVault.getItemPath(item))}
      >{children}</button>
    ),
  }

  const className = 'flex-1 flex gap-2 cursor-pointer overflow-hidden';
  return itemWrapper[item.type](item, children, className);
}

type ItemDetails = {
  [K in ContentTypes]: (item: Content<K>) => ReactNode
}
function ListItemDetails<T extends ContentTypes>(
  {
    item,
  }: {
    item: Content<T>,
  }
) {
  const itemDetails: ItemDetails = {
    link: (item) => (
      <>
        {!item.pinned && (
          <>
            <button onClick={() => {
              UserVault.swapPriority(UserVault.getItemPath(item), -1);
            }}>
              <Icon name={ChevronUp} />
            </button>
            <button onClick={() => {
              UserVault.swapPriority(UserVault.getItemPath(item), 1);
            }}>
              <Icon name={ChevronDown} />
            </button>
          </>
        )}
        <button className='transition-all duration-300'
          onClick={() => UserVault.toggleWatched(
            UserVault.getItemPath(item),
            true
          )}
        >
          <Icon name={Eye} />
        </button>
      </>
    ),
    watched: (item) => (
      <button className='transition-all duration-300 opacity-100'
        onClick={() => UserVault.toggleWatched(
          UserVault.getItemPath(item),
          false
        )}
      >
        <Icon name={Eye} />
      </button>
    ),
    folder: (item) => (
      item.encryption && (
        <button onClick={async () => {
          (await UserVault.encrypt(UserVault.getItemPath(item))).throw();
        }}>
          <Icon name={Lock} />
        </button>
      )
    ),
    encryptedFolder: () => undefined,
  }

  return itemDetails[item.type](item);
}

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

// WORKING but seems overly complicated
// import {
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   Folder,
//   FolderKey,
//   FolderLock,
//   IconNode,
//   Link2,
//   Lock,
//   Pin,
//   Settings2,
// } from 'lucide';
// import { ItemSettings } from '@/components/display';
// import { Icon } from '@/components/ui';
// import { openModal } from '@/effects';
// import UserVault from '@/lib/app/userVault';
// import { Content, ContentTypes, JSXElement } from '@/types';
// import { JSX, ReactElement } from 'jsx-dom';
// 
// type ItemConfigTagMap<T extends ContentTypes> = {
//   link: 'a',
//   watched: 'a',
//   folder: 'button',
//   encryptedFolder: 'button',
// }[T]
// 
// type ItemConfig = {
//   [K in ContentTypes]: (item: Content<K>) => {
//     className?: string,
//     icon: IconNode,
//     // FIX ME get rid of tag and props if we end up using wrapper field
//     tag: ItemConfigTagMap<K>,
//     props?: JSXElement<ItemConfigTagMap<K>>,
//     siblings?: ReactElement,
//     wrapper: JSX.Element,
//   }
// }
// 
// // FIX ME consider moving this to it's own file
// //  - maybe lib, but it contains JSX
// const itemConfig: ItemConfig = {
//   link: (item) => ({
//     className: 'bg-fg text-bg',
//     icon: Link2,
//     tag: 'a',
//     props: {
//       title: `Go to: ${item.href}`,
//       href: item.href,
//     },
//     siblings: (
//       <>
//         {!item.pinned && (
//           <>
//             <button onClick={() => {
//               UserVault.swapPriority(UserVault.getItemPath(item), -1);
//             }}>
//               <Icon name={ChevronUp} />
//             </button>
//             <button onClick={() => {
//               UserVault.swapPriority(UserVault.getItemPath(item), 1);
//             }}>
//               <Icon name={ChevronDown} />
//             </button>
//           </>
//         )}
//         <button className='transition-all duration-300'
//           onClick={() => UserVault.toggleWatched(
//             UserVault.getItemPath(item),
//             true
//           )}
//         >
//           <Icon name={Eye} />
//         </button>
//       </>
//     ),
//     wrapper: <a title={`Go to: ${item.href}`} href={item.href}></a>,
//   }),
//   watched: (item) => ({
//     className: 'bg-fg text-bg opacity-50',
//     icon: Link2,
//     tag: 'a',
//     props: {
//       title: `Go to: ${item.href}`,
//       href: item.href,
//     },
//     siblings: (
//       <>
//         <button className='transition-all duration-300 opacity-100'
//           onClick={() => UserVault.toggleWatched(
//             UserVault.getItemPath(item),
//             false
//           )}
//         >
//           <Icon name={Eye} />
//         </button>
//       </>
//     ),
//     wrapper: <a title={`Go to: ${item.href}`} href={item.href}></a>,
//   }),
//   folder: (item) => ({
//     icon: item.encryption ? FolderKey : Folder,
//     tag: 'button',
//     props: {
//       title: `Enter folder: ${item.title}`,
//       onClick: () => UserVault.setDir(UserVault.getItemPath(item)),
//     },
//     siblings: (
//       <>
//         {item.encryption && <button onClick={async () => {
//           (await UserVault.encrypt(UserVault.getItemPath(item))).throw();
//         }}>
//           <Icon name={Lock} />
//         </button>}
//       </>
//     ),
//     wrapper: <button title={`Enter folder: ${item.title}`}
//       onClick={() => UserVault.setDir(UserVault.getItemPath(item))}
//     ></button>,
//   }),
//   encryptedFolder: (item) => ({
//     icon: FolderLock,
//     tag: 'button',
//     props: {
//       title: `Enter encrypted folder: ${item.title}`,
//       onClick: () => UserVault.setDir(UserVault.getItemPath(item)),
//     },
//     wrapper: <button
//       title={`Enter encrypted folder: ${item.title}`}
//       onClick={() => UserVault.setDir(UserVault.getItemPath(item))}
//     ></button>,
//   }),
// }
// 
// // FIX ME this should just be a wrapper that calls other components for each item type
// //  - example:
// //    - Wrapper components takes an item, and returns
// //      <Wrapper><ListItemComponent /></Wrapper>
// //  - this allows us to maintain same general structure for every item type
// //  - but still allows customization for each item
// //  - it's going to end up pretty similar to render item
// //    - but with the repeated parts all unified in one place
// 
// // FIX ME this will fix the 'as any' cast when calling itemConfig[item.type]
// //  - will probably also have to modify all descendant componets that expect Content
// // export default function ListItem<T extends ContentTypes>({ item }: { item: Content<T> }) {
// export default function ListItem({ item }: { item: Content }) {
//   const {
//     className,
//     icon,
//     siblings,
//     // tag: Wrapper,
//     // props,
//     wrapper: WrapperV2,
//   } = itemConfig[item.type](item as any);
//   const type = item.type[0].toUpperCase() + item.type.slice(1);
//   WrapperV2.append(
//     <>
//       {item.pinned && <Icon name={Pin} className='stroke-green-500' />}
//       <Icon name={icon}/>
//       <span className='truncate'>{item.title}</span>
//     </>
//   )
//   WrapperV2.classList.add('flex-1', 'flex', 'gap-2', 'cursor-pointer', 'overflow-hidden')
//   return (
//     <div className={`flex gap-4 defaultBorder ${className || ''}`}>
//       {WrapperV2}
//       {siblings}
//       <button title={`${type} Settings: ${item.title}`}
//         onClick={() => {
//           openModal(
//             `${type} Settings`,
//             <ItemSettings item={item as Content} />
//           )
//         }}>
//         <Icon name={Settings2} />
//       </button>
//     </div>
//   )
// }

// ORIGINAL VERSION
// FIX ME delete if the above component ends up working
// FIX ME try to tie extraAttrs to props of its tag type
// type ItemTypes = {
//   [K in ContentTypes]: {
//     className?: string,
//     icon: (item: Content<K>) => IconNode,
//     tag: 'a' | 'button',
//     props?: (item: Content<K>) => Object,
//   }
// }
// 
// const itemTypes: ItemTypes = {
//   link: {
//     className: 'bg-fg text-bg',
//     icon: () => Link2,
//     tag: 'a',
//     props: (item) => ({
//       title: `Go to: ${item.href}`,
//       href: item.href,
//     })
//   },
//   watched: {
//     className: 'bg-fg text-bg opacity-50',
//     icon: () => Link2,
//     tag: 'a',
//     props: (item) => ({
//       title: `Go to: ${item.href}`,
//       href: item.href,
//     }),
//   },
//   folder: {
//     icon: (item) => item.encryption ? FolderKey : Folder,
//     tag: 'button',
//     props: (item) => ({
//       title: `Enter folder: ${item.title}`,
//       onClick: () => UserVault.setDir(UserVault.getItemPath(item)),
//     }),
//   },
//   encryptedFolder: {
//     icon: () => FolderLock,
//     tag: 'button',
//     props: (item) => ({
//       title: `Enter encrypted folder: ${item.title}`,
//       onClick: () => UserVault.setDir(UserVault.getItemPath(item)),
//     }),
//   }
// }
// 
// 
// export default function ListItem({ item }: { item: Content }) {
//   const { className, icon, tag, props } = itemTypes[item.type];
//   const Wrapper = tag;
//   const type = item.type[0].toUpperCase + item.type.slice(1);
//   return (
//     <div className={`flex gap-4 default-border ${className || ''}`}>
//       <Wrapper className='flex-1 flex gap-2 cursor-pointer overflow-hidden'
//         {...props?.(item as any)}
//       >
//         {item.pinned && <Icon name={Pin} className='stroke-green-500' />}
//         <Icon name={icon(item as any)} />
//         <span className='truncate'>{item.title}</span>
//       </Wrapper>
//       <button title={`${type} Settings: ${item.title}`}
//         onClick={() => {
//           openModal(
//             `${type} Settings`,
//             <ItemSettings item={item} />
//           )
//         }}>
//         <Icon name={Settings2} />
//       </button>
//     </div>
//   )
// }
