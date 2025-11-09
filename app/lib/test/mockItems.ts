import { getNewSortedKeys } from '@/lib/newVault/utils';
import { Content, ContentTypes, MockItemMap } from '@/types';

const items: MockItemMap = {
  link: (title) => ({
    type: 'link',
    title,
    href: 'https://example.com',
    tags: [],
    pinned: false,
    date: Date.now(),
  }),
  watched: (title) => ({
    type: 'watched',
    title,
    href: 'https://example.com',
    tags: [],
    pinned: false,
    date: Date.now(),
    watched: Date.now(),
  }),
  folder: (title) => ({
    type: 'folder',
    title,
    contents: {},
    tags: [],
    sortedKeys: getNewSortedKeys(),
    pinned: false,
    date: Date.now(),
  }),
  encryptedFolder: (title) => ({
    type: 'encryptedFolder',
    title,
    data: '',
    salt: '',
    iv: '',
    pinned: false,
    date: Date.now(),
  }),
}

export function mockItem<T extends ContentTypes>(
  type: T,
  title: string
): Content<T> {
  return items[type](title);
}

// FIX ME is this really needed since addMockItem now has this functionality built in?
export function togglePinned(item: Content, force?: boolean) {
  item.pinned = force ?? !item.pinned;
  return item;
}
