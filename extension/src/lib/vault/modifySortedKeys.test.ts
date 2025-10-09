import { describe, expect, test } from 'vitest';
import modifySortedKeys, { getItemType } from '@/lib/vault/modifySortedKeys';
import { Content, SortedKeys } from '@/types';

const link: Content<'link'> = {
  type: 'link',
  title: 'link1',
  href: 'https://example.com',
  tags: [],
  pinned: false,
  date: Date.now(),
}

const watched: Content<'watched'> = {
  ...link,
  type: 'watched',
  title: 'watched1',
  watched: Date.now(),
}

const folder: Content<'folder'> = {
  type: 'folder',
  title: 'folder1',
  contents: {},
  pinned: false,
  tags: [],
  sortedKeys: {
    pinned: [],
    folder: [],
    link: [],
    watched: [],
  },
  date: Date.now(),
}

const encryptedFolder: Content<'encryptedFolder'> = {
  type: 'encryptedFolder',
  title: 'encryptedFolder1',
  data: 'data',
  iv: 'iv',
  salt: 'salt',
  date: Date.now(),
  pinned: false,
}

const pinnedFolder: Content<'folder'> = {
  ...folder,
  title: 'pinnedFolder1',
  pinned: true,
}

describe('Get item type', () => {
  test('Get link item type', () => {
    expect(getItemType(link)).toBe('link');
  });

  test('Get folder item type', () => {
    expect(getItemType(folder)).toBe('folder');
  });

  test('Get watched item type', () => {
    expect(getItemType(watched)).toBe('watched');
  });

  test('Get encrypted folder item type', () => {
    expect(getItemType(encryptedFolder)).toBe('folder');
  });

  test('Get pinned item type', () => {
    expect(getItemType(pinnedFolder)).toBe('pinned');
  });
});

describe('Modify sorted keys', () => {
  function getNewSortedKeys(): SortedKeys {
    return {
      pinned: [],
      folder: [],
      link: [],
      watched: [],
    }
  }

  function populateSortedKeys(sortedKeys: SortedKeys) {
    const items = Array(5).fill(0).map((_, i) => {
      const item = { ...link, title: `moveTest${i}` }
      modifySortedKeys.add(sortedKeys, item);
      return item;
    });
    return { items, sortedKeys };
  }

  test('Add', () => {
    const sortedKeys = getNewSortedKeys();
    modifySortedKeys.add(sortedKeys, link);
    expect(sortedKeys.link).toContain(link.title);
    modifySortedKeys.add(sortedKeys, watched);
    expect(sortedKeys.watched).toContain(watched.title);
    modifySortedKeys.add(sortedKeys, folder);
    expect(sortedKeys.folder).toContain(folder.title);
    modifySortedKeys.add(sortedKeys, encryptedFolder);
    expect(sortedKeys.folder).toContain(encryptedFolder.title);
    modifySortedKeys.add(sortedKeys, pinnedFolder);
    expect(sortedKeys.pinned).toContain(pinnedFolder.title);
  });

  test('Delete', () => {
    const sortedKeys = getNewSortedKeys();
    modifySortedKeys.add(sortedKeys, link);
    expect(sortedKeys.link).toContain(link.title);
    modifySortedKeys.delete(sortedKeys, link);
    expect(sortedKeys.link).not.toContain(link.title);
  });

  test('Move item up', () => {
    const { items, sortedKeys } = populateSortedKeys(getNewSortedKeys());
    modifySortedKeys.move(sortedKeys, items[2], -1);
    expect(sortedKeys.link[1]).toBe(items[2].title);
  });

  test('Move item down', () => {
    const { items, sortedKeys } = populateSortedKeys(getNewSortedKeys());
    modifySortedKeys.move(sortedKeys, items[2], 1);
    expect(sortedKeys.link[3]).toBe(items[2].title);
  });

  test('Move item to top', () => {
    const { items, sortedKeys } = populateSortedKeys(getNewSortedKeys());
    modifySortedKeys.move(sortedKeys, items[4], -Infinity);
    expect(sortedKeys.link[0]).toBe(items[4].title);
  });

  test('Move item to bottom', () => {
    const { items, sortedKeys } = populateSortedKeys(getNewSortedKeys());
    modifySortedKeys.move(sortedKeys, items[4], Infinity);
    const lastIndex = sortedKeys.link.length - 1;
    expect(sortedKeys.link[lastIndex]).toBe(items[4].title);
  });
});
