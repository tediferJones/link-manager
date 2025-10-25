import { Content, ContentTypes, MockItemMap } from '@/types'

export function createFolder(title: string): Content<'folder'> {
  return {
    type: 'folder',
    title,
    contents: {},
    tags: [],
    pinned: false,
    sortedKeys: {
      pinned: [],
      folder: [],
      link: [],
      watched: [],
    },
    date: Date.now(),
  }
}

export function createEncryptedFolder(
  title: string
): Content<'encryptedFolder'> {
  return {
    type: 'encryptedFolder',
    title,
    data: '',
    salt: '',
    iv: '',
    pinned: false,
    date: Date.now(),
  }
}

export function createLink(title: string): Content<'link'> {
  return {
    type: 'link',
    title,
    href: 'https://example.com',
    tags: [],
    pinned: false,
    date: Date.now(),
  }
}

export function createWatched(title: string): Content<'watched'> {
  return {
    type: 'watched',
    title,
    href: 'https://example.com',
    tags: [],
    pinned: false,
    date: Date.now(),
    watched: Date.now(),
  }
}

// FIX ME replace all other createItem calls with this function
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
    sortedKeys: {
      pinned: [],
      folder: [],
      link: [],
      watched: [],
    },
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
