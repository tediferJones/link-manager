import { Content } from '@/types'

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
