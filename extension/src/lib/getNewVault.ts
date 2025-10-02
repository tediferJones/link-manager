import { Content } from '@/types';

export default function getNewVault(): Content<'folder'> {
  return {
    type: 'folder',
    title: '',
    contents: {},
    tags: [],
    pinned: false,
    sortedKeys: {
      pinned: [],
      folder: [],
      link: [],
      watched: [],
    },
  }
}
