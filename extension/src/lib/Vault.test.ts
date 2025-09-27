import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import Vault from '@/lib/Vault';
import { Content } from '@/types';

const vault = new Vault();

function createLink(title: string): Content<'link'> {
  return {
    type: 'link',
    title,
    href: 'https://example.com',
    tags: [],
    pinned: false,
  }
}

function createFolder(title: string): Content<'folder'> {
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
    }
  }
}

describe('Add item', () => {
  const linkTitle = 'testLink';
  const testLink = createLink('testLink');
  const path: string[] = [];
  test('Add item to vault', async () => {
    const addResult = await vault.add(testLink, path);
    expect(addResult.success).toBeTruthy();
    if (addResult.success) expect(addResult.data).toBe(testLink);
    expect(vault.root.contents[linkTitle]).toBe(testLink);
    expect(vault.root.sortedKeys.link.includes(linkTitle)).toBeTruthy();
  });

  test('Fail to add duplicate', async () => {
    const addResult = await vault.add(testLink, path);
    expect(addResult.success).toBeFalsy();
  });
})

describe('Delete item', () => {
  test('Delete item from vault', async () => {
    const linkTitle = 'testLink';
    await vault.delete([ linkTitle ]);
    expect(vault.root.contents[linkTitle]).toBeUndefined();
    expect(vault.root.sortedKeys.link.includes(linkTitle)).toBeFalsy();
  });

  // FIX ME test deleting an item that does not exist
})

describe('Get item', async () => {
  const linkTitle = 'testLink';
  const pathToItem = [ linkTitle ];

  beforeAll(async () => {
    await vault.add(createLink(linkTitle), []);
  })

  test('Get any item', async () => {
    const itemResult = vault.get(pathToItem);
    expect(itemResult.success).toBeTruthy();
  });

  test('Get typed link', async () => {
    const itemResult = vault.get(pathToItem, 'link');
    expect(itemResult.success).toBeTruthy();
    if (itemResult.success) expect(itemResult.data.type).toBe('link');
  });
  
  test('Get item with wrong type', async () => {
    const itemResult = vault.get(pathToItem, 'folder');
    expect(itemResult.success).toBeFalsy();
  });

  // FIX ME should probably make tests for more combos of item types
  // for every type, test that it gets the right item for no type and every other type

  afterAll(async () => {
    await vault.delete([ linkTitle ]);
  })
});

test('Rename item', async () => {
  const linkTitle = 'testLink';
  const path: string[] = [];
  const addItemResult = await vault.add(createLink(linkTitle), path);
  expect(addItemResult.success).toBeTruthy();
  if (!addItemResult.success) throw Error()
  const item = addItemResult.data;
  const newTitle = `${linkTitle}-RENAMED`;
  const renameResult = await vault.rename(newTitle, path.concat(linkTitle));
  expect(renameResult.success).toBeTruthy();
  const renamedItemResult = vault.get(path.concat(newTitle));
  expect(renamedItemResult.success).toBeTruthy();
  if (renamedItemResult.success) expect(renamedItemResult.data).toBe(item);

  // FIX ME test renaming an item that does not exist
})

test('Move item', async () => {
  const linkTitle = 'testLink';
  const folderTitle = 'folder1';
  await vault.add(createLink(linkTitle), []);
  await vault.add(createFolder(folderTitle), []);
  await vault.move([ linkTitle ], [ folderTitle ]);
  expect(vault.root.contents[linkTitle]).toBeUndefined();
  expect(vault.root.sortedKeys.link.includes(linkTitle)).toBeFalsy();
});
