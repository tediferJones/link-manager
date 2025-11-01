import getNewSortedKeys from '@/lib/vault/getNewSortedKeys';
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

export function togglePinned(item: Content, force?: boolean) {
  item.pinned = force ?? !item.pinned;
  return item;
}
