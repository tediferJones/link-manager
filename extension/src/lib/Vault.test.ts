import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import Vault from '@/lib/Vault';
import Result from '@/lib/Result';
import { Content } from '@/types';

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
    },
  }
}

async function addItem(title: string, type: 'folder' | 'link', path: string[]) {
  const itemFactory = {
    folder: createFolder,
    link: createLink,
  }[type];
  const item = itemFactory(title);
  const addedResult = await vault.add(path, item);
  return { result: addedResult, path: path.concat(item.title) };
}

function testResultFailure<T>(result: Result<T>) {
  expect(result.success()).toBe(false);
  expect(result.error()).toBeTypeOf('string');
  expect(result.error()).toBeTruthy();
}

function testResultSuccess<T>(result: Result<T>) {
  expect(result.success()).toBe(true);
  expect(result.data()).toBeDefined();
  return result.data();
}

// FIX ME write function to populate a vault with some generic items
// add one of every type
// add at least one folder with nested items
// add at least one encrypted folder with nested items
// add at least one encrypted folder with at least one nested encrypted folder
let vault: Vault;
function resetVault() {
  vault = new Vault();
}

const rootPath: string[] = [];
const dnePath: string[] = [ 'thisItemDoesNotExist' ];
const password = 'password';

function describeWithSetup(name: string, func: () => void) {
  describe(name, () => {
    beforeEach(resetVault);
    afterEach(resetVault);
    func();
  });
}

describeWithSetup('Add item', () => {
  test('Add item to vault', async () => {
    const { result } = await addItem('link1', 'link', rootPath);
    expect(result.success()).toBe(true);
    const item = result.data();
    expect(vault.root.contents[item.title]).toBe(item);
    expect(vault.root.sortedKeys.link).toContain(item.title);
  });

  test('Fail to add duplicate', async () => {
    const { result: result1 } = await addItem('link1', 'link', rootPath);
    testResultSuccess(result1);
    const { result: result2 } = await addItem('link1', 'link', rootPath);
    testResultFailure(result2);
  });
});

describeWithSetup('Delete item', () => {
  test('Delete item from vault', async () => {
    const linkTitle = 'link1';
    const { result, path } = await addItem(linkTitle, 'link', rootPath);
    testResultSuccess(result);
    testResultSuccess(await vault.delete(path));
    expect(vault.root.contents[linkTitle]).toBeUndefined();
    expect(vault.root.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Attempt to delete item that does not exist', async () => {
    testResultFailure(await vault.delete(dnePath));
  });
});

describeWithSetup('Get item', async () => {
  test('Get any item', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    testResultSuccess(vault.get(path));
  });

  test('Get typed link', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const item = testResultSuccess(vault.get(path, 'link'));
    expect(item.type).toBe('link');
  });

  test('Get item with wrong type', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    testResultFailure(vault.get(path, 'folder'));
  });

  // FIX ME should probably make tests for more combos of item types
  // for every type, test that it gets the right item for no type and every other type
});

describeWithSetup('Rename item', () => {
  test('Rename existing item', async () => {
    const linkTitle = 'link1';
    const { result, path } = await addItem(linkTitle, 'link', rootPath);
    const item = testResultSuccess(result);
    const newTitle = `${linkTitle}-RENAMED`
    const renamedPath = rootPath.concat(newTitle);
    testResultSuccess(await vault.rename(path, newTitle));
    const renamedItem = testResultSuccess(vault.get(renamedPath));
    expect(renamedItem).toBe(item);
  });

  test('Fail to rename item that does not exist', async () => {
    testResultFailure(await vault.rename(dnePath, 'newTitle'));
  });
});

describeWithSetup('Move item', async () => {
  test('Move existing item to existing path', async () => {
    const linkTitle = 'link1';
    const { result: linkResult, path: linkPath } = await addItem(
      linkTitle,
      'link',
      rootPath
    );
    const linkItem = testResultSuccess(linkResult);
    const { result: folderResult, path: folderPath } = await addItem(
      'folder1',
      'folder',
      rootPath
    );
    testResultSuccess(folderResult);
    testResultSuccess(await vault.move(linkPath, folderPath));
    testResultFailure(vault.get(linkPath));
    const linkParent = testResultSuccess(
      vault.get(vault.getParentPath(linkPath), 'folder')
    );
    expect(linkParent.sortedKeys.link).not.toContain(linkTitle);
    const folder = testResultSuccess(vault.get(folderPath, 'folder'));
    expect(folder.contents[linkTitle]).toBe(linkItem)
    expect(folder.sortedKeys.link).toContain(linkTitle);
  });

  test('Fail to move item that does not exist to existing path', async () => {
    testResultFailure(await vault.move(dnePath, [ 'folder1' ]));
  });

  test('Fail to move existing item to path that does not exist', async () => {
    testResultFailure(await vault.move([ 'folder1' ], dnePath));
  });

  test('Fail to move item that does not exist to path that does not exist',
    async () => {
      testResultFailure(await vault.move(dnePath, dnePath));
    }
  );
});

describeWithSetup('Copy item', async () => {
  test('Copy without title collision', async () => {
    const linkTitle = 'link1';
    const { path } = await addItem(linkTitle, 'link', rootPath);
    const copyResult = await vault.copy(path);
    const item = testResultSuccess(copyResult);
    expect(item.title).toBe(`${linkTitle}-COPY`);
  });

  test('Copy with title collision', async () => {
    const linkTitle = 'link1';
    const { path } = await addItem(linkTitle, 'link', rootPath);
    testResultSuccess(await vault.copy(path));
    const copyDuplicateResult = await vault.copy(path);
    const copyDuplicate = testResultSuccess(copyDuplicateResult);
    expect(copyDuplicate.title).toBe(`${linkTitle}-COPY-COPY`);
  });

  // FIX ME test copying item that does not exist

  // FIX ME test if copy will fail after reaching maxAttempt value
  // easy test: pass a lower maxAttempt value or higher attempt start value
});

describeWithSetup('Toggle encryption status', async () => {
  test('Enable encryption', async () => {
    const { path } = await addItem('encrypionTest', 'folder', rootPath);
    const encryptableFolder = testResultSuccess(
      await vault.enableEncryption(path, password)
    );
    // FIX ME maybe change to using the 'in' operator
    // see 'Encrypt without preserve arg' test for example
    expect(encryptableFolder.encryption).toBeDefined();
    expect(encryptableFolder.encryption!.key).toBeDefined();
    expect(encryptableFolder.encryption!.iv).toBeTypeOf('string');
    expect(encryptableFolder.encryption!.salt).toBeTypeOf('string');
  });

  test('Attempt to enable encryption of non-folder item', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    testResultFailure(await vault.enableEncryption(path, password));
  });

  test('Disable encryption', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    testResultSuccess(await vault.enableEncryption(path, password));
    const disabledEncryptionFolder = testResultSuccess(
      await vault.disableEncryption(path)
    );
    expect(disabledEncryptionFolder.encryption).toBeUndefined();
  });

  test('Attempt to disable encryption of item without encryption enabled',
    async () => {
      const { path } = await addItem('folder1', 'folder', rootPath);
      testResultFailure(await vault.disableEncryption(path));
    }
  );
});

describeWithSetup('Encryption', () => {
  test('Encrypt folder', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    await vault.enableEncryption(path, password);
    await vault.encrypt(path);
    const encryptedResult = vault.get(path, 'encryptedFolder');
    const encrypted = testResultSuccess(encryptedResult);
    expect(encrypted.iv).toBeTypeOf('string');
    expect(encrypted.salt).toBeTypeOf('string');
    expect(encrypted.data).toBeTypeOf('string');
    expect('contents' in encrypted).toBe(false);
    expect('tags' in encrypted).toBe(false);
    expect('sortedKeys' in encrypted).toBe(false);
  });

  test('Attempt encrypting folder without encryption enabled', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    testResultSuccess(vault.get(path));
    testResultFailure(await vault.encrypt(path));
  });

  test('Encrypt with preserve arg', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    const enableEncryptionResult = await vault.enableEncryption(
      path,
      password
    );
    const encryptableFolder = testResultSuccess(enableEncryptionResult);
    testResultSuccess(await vault.encrypt(path, 'preserve'));
    const encryptedWithPreserve = testResultSuccess(vault.get(path));
    expect(encryptedWithPreserve).toBe(encryptableFolder);
  });

  test('Encrypt without preserve arg', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    const encryptableFolder = testResultSuccess(
      await vault.enableEncryption(path, password)
    );
    testResultSuccess(await vault.encrypt(path));
    // FIX ME make a function that will differentiate between folders and encryptedFolders based on keys
    // ideally this should be directly linked to the types file
    // maybe create const arrays for these keys and derive types from these arrays?
    // then export those arrays and use them here for testing
    expect('data' in encryptableFolder).toBe(true);
    expect('iv' in encryptableFolder).toBe(true);
    expect('salt' in encryptableFolder).toBe(true);
    expect('content' in encryptableFolder).toBe(false);
    expect('tags' in encryptableFolder).toBe(false);
    expect('sortedKeys' in encryptableFolder).toBe(false);
  });
});

describeWithSetup('Decryption', () => {
  test('Decrypt encrypted folder', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    testResultSuccess(await vault.enableEncryption(path, password));
    testResultSuccess(await vault.encrypt(path));
    const decryptedItem = testResultSuccess(
      await vault.decrypt(path, password)
    );
    expect(decryptedItem.type).toBe('folder');
    expect('contents' in decryptedItem).toBe(true);
    expect('sortedKeys' in decryptedItem).toBe(true);
    expect('tags' in decryptedItem).toBe(true);
    expect('encryption' in decryptedItem).toBe(true);
    if (decryptedItem.encryption) {
      expect('key' in decryptedItem.encryption).toBe(true);
      expect('iv' in decryptedItem.encryption).toBe(true);
      expect('salt' in decryptedItem.encryption).toBe(true);
    }
  });

  test('Attempt decrypt with wrong password', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    testResultSuccess(await vault.enableEncryption(path, password));
    testResultSuccess(await vault.encrypt(path));
    testResultFailure(await vault.decrypt(path, 'wrongPassword'));
  });

  test('Attempt decrypt with invalid path', async () => {
    testResultFailure(await vault.decrypt(dnePath, password));
  });

  test('Attempt decrypt of not encrypted item', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    testResultFailure(await vault.decrypt(path, password));
  });
});

// FIX ME test vault.pack

describeWithSetup('Get view path', () => {
  test('Stop at encrypted folder', async () => {
    const { path: path1 } = await addItem('folder1', 'folder', rootPath);
    const { path: path2 } = await addItem('folder2', 'folder', path1);
    const { path: path3 } = await addItem('folder3', 'folder', path2);

    testResultSuccess(await vault.enableEncryption(path2, password));
    testResultSuccess(await vault.encrypt(path2));

    const viewPath = vault.getViewPath(path3);
    expect(viewPath).toEqual(path2);
  });

  test('Return full path if no children are encrypted', async () => {
    const { path: path1 } = await addItem('folder1', 'folder', rootPath);
    const { path: path2 } = await addItem('folder2', 'folder', path1);
    const { path: path3 } = await addItem('folder3', 'folder', path2);

    const viewPath = vault.getViewPath(path3);
    expect(viewPath).toEqual(path3);
  });
});

describeWithSetup('Edit tags', () => {
  const newTag = 'testTag';
  test('Add tag', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const addTagResult = await vault.editTags(path, 'add', newTag);
    const item = testResultSuccess(addTagResult);
    expect(item.tags).toContain(newTag);
  });

  test('Remove tag', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const addTagResult = await vault.editTags(path, 'add', newTag);
    const itemWithTag = testResultSuccess(addTagResult);
    expect(itemWithTag.tags).toContain(newTag);
    const deleteTagResult = await vault.editTags(path, 'delete', newTag);
    const itemWithoutTag = testResultSuccess(deleteTagResult);
    expect(itemWithoutTag.tags).not.toContain(newTag);
  });

  test('Fail to add tag to encrypted folder', async () => {
    const { path } = await addItem('folder1', 'folder', rootPath);
    testResultSuccess(await vault.enableEncryption(path, password));
    testResultSuccess(await vault.encrypt(path));
    testResultFailure(await vault.editTags(path, 'add', newTag));
  });

  // FIX ME add tests for adding/deleting multiple tags at once
});

describeWithSetup('Set watched', () => {
  test('Toggle link to watched', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const setWatchedResult = await vault.toggleWatched(path);
    const watched = testResultSuccess(setWatchedResult);
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
  });

  test('Toggle watched to link', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    testResultSuccess(await vault.toggleWatched(path));
    const link = testResultSuccess(await vault.toggleWatched(path));
    expect(link.type).toBe('link');
    expect('watched' in link).toBe(false);
  });

  test('Force change link to watched', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const forceWatched = testResultSuccess(await vault.toggleWatched(path, true));
    expect(forceWatched.type).toBe('watched');
    expect('watched' in forceWatched).toBe(true);
  });

  test('Force change watched to link', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const watched = testResultSuccess(await vault.toggleWatched(path));
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
    const forceLink = testResultSuccess(await vault.toggleWatched(path, false));
    expect(forceLink.type).toBe('link');
    expect('watched' in forceLink).toBe(false);
  });

  test('Force link to link', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    const link = testResultSuccess(await vault.toggleWatched(path, false));
    expect(link.type).toBe('link');
    expect('watched' in link).toBe(false);
  });

  test('Force watched to watched', async () => {
    const { path } = await addItem('link1', 'link', rootPath);
    testResultSuccess(await vault.toggleWatched(path));
    const watched = testResultSuccess(await vault.toggleWatched(path, true));
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
  });
});

describeWithSetup('Swap priority', () => {
  test('Swap +1', async () => {
    await addItem('link1', 'link', rootPath);
    const { path, result } = await addItem('link2', 'link', rootPath);
    const item = testResultSuccess(result);
    await addItem('link3', 'link', rootPath);
    testResultSuccess(await vault.swapPriority(path, 1));
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[2]).toBe(item.title);
  });

  test('Swap -1', async () => {
    await addItem('link1', 'link', rootPath);
    const { path, result } = await addItem('link2', 'link', rootPath);
    const item = testResultSuccess(result);
    await addItem('link3', 'link', rootPath);
    testResultSuccess(await vault.swapPriority(path, -1));
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[0]).toBe(item.title);
  });

  test('Swap to first position', async () => {
    const addedItems = await Promise.all(
      Array(5).fill(0).map(async (_, i) => {
        return await addItem(`link${i}`, 'link', rootPath);
      })
    );
    const { path, result } = addedItems[4];
    const item = testResultSuccess(result);
    testResultSuccess(await vault.swapPriority(path, -Infinity));
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[0]).toBe(item.title);
  });

  test('Swap to last position', async () => {
    const addedItems = await Promise.all(
      Array(5).fill(0).map(async (_, i) => {
        return await addItem(`link${i}`, 'link', rootPath);
      })
    );
    const { path, result } = addedItems[1];
    const item = testResultSuccess(result);
    testResultSuccess(await vault.swapPriority(path, Infinity));
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link[4]).toBe(item.title);
  });
});

describeWithSetup('Set pinned', () => {
  const linkTitle = 'link1'

  test('Toggle pinned true', async () => {
    const { path } = await addItem(linkTitle, 'link', rootPath);
    const item = testResultSuccess(await vault.togglePinned(path));
    expect(item.pinned).toBe(true);
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.pinned).toContain(linkTitle);
    expect(parent.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Toggle pinned false', async () => {
    const { path } = await addItem(linkTitle, 'link', rootPath);
    testResultSuccess(await vault.togglePinned(path));
    const item = testResultSuccess(await vault.togglePinned(path));
    expect(item.pinned).toBe(false);
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link).toContain(linkTitle);
    expect(parent.sortedKeys.pinned).not.toContain(linkTitle);
  });

  test('Force pinned true', async () => {
    const { path } = await addItem(linkTitle, 'link', rootPath);
    const item = testResultSuccess(await vault.togglePinned(path, true));
    expect(item.pinned).toBe(true);
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.pinned).toContain(linkTitle);
    expect(parent.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Force pinned false', async () => {
    const { path } = await addItem(linkTitle, 'link', rootPath);
    testResultSuccess(await vault.togglePinned(path));
    const item = testResultSuccess(await vault.togglePinned(path, false));
    expect(item.pinned).toBe(false);
    const parent = testResultSuccess(
      vault.get(vault.getParentPath(path), 'folder')
    );
    expect(parent.sortedKeys.link).toContain(linkTitle);
    expect(parent.sortedKeys.pinned).not.toContain(linkTitle);
  });
});

describeWithSetup('Query vault', () => {
  test('Basic query', async () => {
    const { result } = await addItem('link1', 'link', rootPath);
    const item = testResultSuccess(result)
    await addItem('folder1', 'folder', rootPath);
    const queryResult = testResultSuccess(
      await vault.query(
        [],
        (found, item) => item.title === 'link1' ? item : found,
        {} as Content
      )
    );
    expect(queryResult).toBe(item);
  });

  test('Crawl nested directories', async () => {
    const { path: path1 } = await addItem('folder1', 'folder', rootPath);
    const { path: path2 } = await addItem('folder2', 'folder', path1);
    const { path: path3 } = await addItem('folder3', 'folder', path1);
    await addItem('folder4', 'folder', path2);
    await addItem('link1', 'folder', path2);
    await addItem('folder5', 'folder', path3)
    await addItem('link2', 'folder', path3);
    const queryResult = testResultSuccess(
      await vault.query(
        rootPath,
        (allItems, item) => allItems.concat(item),
        [] as Content[],
      )
    );
    // 7 items + root = 8
    expect(queryResult).toHaveLength(8);
  });

  test('Crawl from given path', async () => {
    const { path: path1 } = await addItem('folder1', 'folder', rootPath);
    const { path: path2 } = await addItem('folder2', 'folder', path1);
    const { path: path3 } = await addItem('folder3', 'folder', path1);
    await addItem('folder4', 'folder', path2);
    await addItem('link1', 'folder', path2);
    await addItem('folder5', 'folder', path3)
    await addItem('link2', 'folder', path3);
    const queryResult = testResultSuccess(
      await vault.query(
        path2,
        (allItems, item) => allItems.concat(item),
        [] as Content[],
      )
    );
    expect(queryResult).toHaveLength(3);
  });
});
