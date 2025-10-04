import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { testResultFailure, testResultSuccess } from '@/lib/testHelpers';
import Vault from '@/lib/Vault';
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
  const addResult = await vault.add(item, path);
  const addedItem = testResultSuccess(addResult);
  return { item: addedItem, path: path.concat(item.title) }
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
const password = 'password';

function describeWithSetup(name: string, func: () => void) {
  describe(name, () => {
    beforeEach(resetVault);
    afterEach(resetVault);
    func();
  });
}

// FIX ME simplify tests and minimize repeated code with helper functions
// use addItem function
// stop doing:
//  const someResult = vault.something();
//  testResult(someResult);
// just do:
// testResult(vault.something());

describeWithSetup('Add item', () => {
  const linkTitle = 'testLink';
  const testLink = createLink('testLink');
  test('Add item to vault', async () => {
    const addResult = await vault.add(testLink, rootPath);
    expect(addResult.success).toBeTruthy();
    if (addResult.success) expect(addResult.data).toBe(testLink);
    expect(vault.root.contents[linkTitle]).toBe(testLink);
    expect(vault.root.sortedKeys.link).toContain(linkTitle);
  });

  test('Fail to add duplicate', async () => {
    const addResult = await vault.add(testLink, rootPath);
    testResultSuccess(addResult);
    const addDuplicateResult = await vault.add(testLink, rootPath);
    testResultFailure(addDuplicateResult);
  });
});

describeWithSetup('Delete item', () => {
  test('Delete item from vault', async () => {
    const linkTitle = 'testLink';
    await vault.delete([ linkTitle ]);
    expect(vault.root.contents[linkTitle]).toBeUndefined();
    expect(vault.root.sortedKeys.link).not.toContain(linkTitle);
  });

  test('Attempt to delete item that does not exist', async () => {
    const attemptDeleteResult = await vault.delete([ 'thisItemDoesNotExist' ]);
    testResultFailure(attemptDeleteResult);
  });
});

describeWithSetup('Get item', async () => {
  const linkTitle = 'testLink';
  const pathToItem = [ linkTitle ];

  test('Get any item', async () => {
    await vault.add(createLink(linkTitle), rootPath);
    const itemResult = vault.get(pathToItem);
    testResultSuccess(itemResult);
  });

  test('Get typed link', async () => {
    await vault.add(createLink(linkTitle), rootPath)
    const itemResult = vault.get(pathToItem, 'link');
    const item = testResultSuccess(itemResult);
    expect(item.type).toBe('link')
  });

  test('Get item with wrong type', async () => {
    const itemResult = vault.get(pathToItem, 'folder');
    testResultFailure(itemResult);
  });

  // FIX ME should probably make tests for more combos of item types
  // for every type, test that it gets the right item for no type and every other type
});

describeWithSetup('Rename item', () => {
  test('Rename existing item', async () => {
    const linkTitle = 'testLink';
    const path: string[] = [];
    const addItemResult = await vault.add(createLink(linkTitle), path);
    const item = testResultSuccess(addItemResult);
    const newTitle = `${linkTitle}-RENAMED`;
    const renameResult = await vault.rename(newTitle, path.concat(linkTitle));
    expect(renameResult.success).toBeTruthy();
    const renamedItemResult = vault.get(path.concat(newTitle));
    expect(renamedItemResult.success).toBeTruthy();
    if (renamedItemResult.success) expect(renamedItemResult.data).toBe(item);
  });

  test('Fail to rename item that does not exist', async () => {
    const attemptRenameResult = await vault.rename(
      'newTitle',
      [ 'thisItemDoesNotExist' ]
    );
    testResultFailure(attemptRenameResult);
  });
});

describeWithSetup('Move item', async () => {
  test('Move existing item to existing path', async () => {
    const linkTitle = 'testLink';
    const folderTitle = 'folder1';
    await vault.add(createLink(linkTitle), []);
    await vault.add(createFolder(folderTitle), []);
    await vault.move([ linkTitle ], [ folderTitle ]);
    expect(vault.root.contents[linkTitle]).toBeUndefined();
    expect(vault.root.sortedKeys.link).not.toContain(linkTitle);
    const destinationFolderResult = vault.get([ folderTitle ], 'folder');
    const destinationFolder = testResultSuccess(destinationFolderResult);
    expect(destinationFolder.sortedKeys.link).toContain(linkTitle);
  });

  test('Fail to move item that does not exist to existing path', async () => {
    const attemptMoveResult = await vault.move(
      [ 'thisItemDoesNotExist' ],
      [ 'folder1' ]
    );
    testResultFailure(attemptMoveResult);
  });

  test('Fail to move existing item to path that does not exist', async () => {
    const attemptMoveResult = await vault.move(
      [ 'folder1' ],
      [ 'thisItemDoesNotExist' ]
    );
    testResultFailure(attemptMoveResult);
  });

  test('Fail to move item that does not exist to path that does not exist',
    async () => {
      const attemptMoveResult = await vault.move(
        [ 'thisItemDoesNotExist' ],
        [ 'thisPathDoesNotExist' ]
      );
      testResultFailure(attemptMoveResult);
    }
  );
});

describeWithSetup('Copy item', async () => {
  test('Copy without title collision', async () => {
    const linkTitle = 'testLink';
    const itemPath = [ linkTitle ];
    await vault.add(createLink(linkTitle), rootPath);

    const copyResult = await vault.copy(itemPath);
    const item = testResultSuccess(copyResult);
    expect(item.title).toBe(`${linkTitle}-COPY`);
  });

  test('Copy with title collision', async () => {
    const linkTitle = 'testLink';
    const itemPath = [ linkTitle ];
    await vault.add(createLink(linkTitle), rootPath);

    const copyResult = await vault.copy(itemPath);
    testResultSuccess(copyResult);
    const copyDuplicateResult = await vault.copy(itemPath);
    const copyDuplicate = testResultSuccess(copyDuplicateResult);
    expect(copyDuplicate.title).toBe(`${linkTitle}-COPY-COPY`);
  });

  // FIX ME test if copy will fail after reaching maxAttempt value
  // easy test: pass a lower maxAttempt value or higher attempt start value
});

describeWithSetup('Toggle encryption status', async () => {
  test('Enable encryption', async () => {
    const folderTitle = 'encryptionTest';
    await vault.add(createFolder(folderTitle), rootPath);
    const enableEncryptionResult = await vault.enableEncryption(
      [ folderTitle ],
      password
    );
    const encryptableFolder = testResultSuccess(enableEncryptionResult);
    // FIX ME maybe change to using the 'in' operator
    // see 'Encrypt without preserve arg' test for example
    expect(encryptableFolder.encryption).toBeDefined();
    expect(encryptableFolder.encryption!.key).toBeDefined();
    expect(encryptableFolder.encryption!.iv).toBeTypeOf('string');
    expect(encryptableFolder.encryption!.salt).toBeTypeOf('string');
  });

  test('Attempt to enable encryption of non-folder item', async () => {
    const linkTitle = 'testLink';
    await vault.add(createLink(linkTitle), rootPath);
    const attemptEncryptResult = await vault.enableEncryption(
      [ linkTitle ],
      password,
    );
    testResultFailure(attemptEncryptResult);
  });

  test('Disable encryption', async () => {
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    await vault.add(createFolder(folderTitle), rootPath);
    await vault.enableEncryption(itemPath, password);
    const disableEncryptionResult = await vault.disableEncryption(
      itemPath
    );
    const disabledEncryptionFolder = testResultSuccess(disableEncryptionResult);
    expect(disabledEncryptionFolder.encryption).toBeUndefined();
  });

  test('Attempt to disable encryption of item without encryption enabled',
    async () => {
      const attemptDisableEncryptionResult = await vault.disableEncryption(
        [ 'folder1' ]
      );
      testResultFailure(attemptDisableEncryptionResult);
    }
  );
});

describeWithSetup('Encryption', () => {
  test('Encrypt folder', async () => {
    const folderTitle = 'testFolder';
    const pathToFolder = [ folderTitle ];
    await vault.add(createFolder(folderTitle), rootPath);
    await vault.enableEncryption(pathToFolder, password);
    await vault.encrypt(pathToFolder);
    const encryptedResult = vault.get(pathToFolder, 'encryptedFolder');
    const encrypted = testResultSuccess(encryptedResult);
    expect(encrypted.iv).toBeTypeOf('string');
    expect(encrypted.salt).toBeTypeOf('string');
    expect(encrypted.data).toBeTypeOf('string');
    expect('contents' in encrypted).toBe(false);
    expect('tags' in encrypted).toBe(false);
    expect('sortedKeys' in encrypted).toBe(false);
  });

  test('Attempt encrypting folder without encryption enabled', async () => {
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    await vault.add(createFolder(folderTitle), rootPath);
    const folderResult = vault.get(itemPath);
    testResultSuccess(folderResult);
    const failedEncryptResult = await vault.encrypt(itemPath);
    testResultFailure(failedEncryptResult);
  });

  test('Encrypt with preserve arg', async () => {
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    await vault.add(createFolder(folderTitle), rootPath);
    const enableEncryptionResult = await vault.enableEncryption(
      itemPath,
      password
    );
    const encryptableFolder = testResultSuccess(enableEncryptionResult);
    const encryptedResult = await vault.encrypt(
      itemPath,
      'preserve'
    );
    testResultSuccess(encryptedResult);
    const encryptedWithPreserveResult = vault.get(itemPath);
    const encryptedWithPreserve = testResultSuccess(
      encryptedWithPreserveResult
    );
    expect(encryptedWithPreserve).toBe(encryptableFolder);
  });

  test('Encrypt without preserve arg', async () => {
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    await vault.add(createFolder(folderTitle), rootPath);
    const enableEncryptionResult = await vault.enableEncryption(
      itemPath,
      password
    );
    const encryptableFolder = testResultSuccess(enableEncryptionResult);
    const encryptedResult = await vault.encrypt(itemPath);
    testResultSuccess(encryptedResult);
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
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    const addResult = await vault.add(createFolder(folderTitle), rootPath);
    testResultSuccess(addResult);
    const enableEncryptionResult = await vault.enableEncryption(
      itemPath,
      password
    );
    testResultSuccess(enableEncryptionResult);
    const encryptedResult = await vault.encrypt(itemPath);
    testResultSuccess(encryptedResult);
    const decryptedResult = await vault.decrypt(itemPath, password);
    const decryptedItem = testResultSuccess(decryptedResult);
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
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    const addResult = await vault.add(createFolder(folderTitle), rootPath);
    testResultSuccess(addResult);
    const enableEncryptionResult = await vault.enableEncryption(
      itemPath,
      password
    );
    testResultSuccess(enableEncryptionResult);
    const encryptedResult = await vault.encrypt(itemPath);
    testResultSuccess(encryptedResult);
    const decryptedResult = await vault.decrypt(itemPath, 'wrongPassword');
    testResultFailure(decryptedResult);
  });

  test('Attempt decrypt with invalid path', async () => {
    const decryptResult = await vault.decrypt([ 'invalidPath' ], password);
    testResultFailure(decryptResult);
  });

  test('Attempt decrypt of not encrypted item', async () => {
    const folderTitle = 'testFolder';
    const itemPath = [ folderTitle ];
    const addResult = await vault.add(createFolder(folderTitle), rootPath);
    testResultSuccess(addResult);
    const decryptedResult = await vault.decrypt(itemPath, password);
    testResultFailure(decryptedResult);
  });
});

// FIX ME test vault.pack

describeWithSetup('Get view path', () => {
  test('Stop at encrypted folder', async () => {
    const folderTitle1 = 'folder1';
    const addResult1 = await vault.add(createFolder(folderTitle1), rootPath);
    testResultSuccess(addResult1);
    const folderPath1 = rootPath.concat(folderTitle1);
    const folderTitle2 = 'folder2';
    const addResult2 = await vault.add(createFolder(folderTitle2), folderPath1);
    testResultSuccess(addResult2);
    const folderPath2 = folderPath1.concat(folderTitle2);
    const folderTitle3 = 'folder3';
    const addResult3 = await vault.add(createFolder(folderTitle3), folderPath2);
    testResultSuccess(addResult3);
    const folderPath3 = folderPath2.concat(folderTitle3);

    const enableEncryptionResult = await vault.enableEncryption(
      folderPath2,
      password
    );
    testResultSuccess(enableEncryptionResult);
    const encryptResult = await vault.encrypt(folderPath2);
    testResultSuccess(encryptResult);

    const viewPath = vault.getViewDir(folderPath3);
    expect(viewPath).toEqual(folderPath2);
  });

  test('Return full path if no children are encrypted', async () => {
    const folderTitle1 = 'folder1';
    const addResult1 = await vault.add(createFolder(folderTitle1), rootPath);
    testResultSuccess(addResult1);
    const folderPath1 = rootPath.concat(folderTitle1);
    const folderTitle2 = 'folder2';
    const addResult2 = await vault.add(createFolder(folderTitle2), folderPath1);
    testResultSuccess(addResult2);
    const folderPath2 = folderPath1.concat(folderTitle2);
    const folderTitle3 = 'folder3';
    const addResult3 = await vault.add(createFolder(folderTitle3), folderPath2);
    testResultSuccess(addResult3);
    const folderPath3 = folderPath2.concat(folderTitle3);
    const viewPath = vault.getViewDir(folderPath3);
    expect(viewPath).toEqual(folderPath3);
  });
});

describeWithSetup('Edit tags', () => {
  test('Add tag', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const newTag = 'testTag';
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const addTagResult = await vault.editTags(itemPath, newTag, 'add');
    const item = testResultSuccess(addTagResult);
    expect(item.tags).toContain(newTag);
  });

  test('Remove tag', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const newTag = 'testTag';
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const addTagResult = await vault.editTags(itemPath, newTag, 'add');
    const itemWithTag = testResultSuccess(addTagResult);
    expect(itemWithTag.tags).toContain(newTag);
    const deleteTagResult = await vault.editTags(itemPath, newTag, 'delete');
    const itemWithoutTag = testResultSuccess(deleteTagResult);
    expect(itemWithoutTag.tags).not.toContain(newTag);
  });

  test('Fail to add tag to encrypted folder', async () => {
    const folderTitle = 'folderTitle';
    const itemPath = [ folderTitle ];
    const newTag = 'testTag';
    const addResult = await vault.add(createFolder(folderTitle), rootPath);
    testResultSuccess(addResult);
    const enableEncryptionResult = await vault.enableEncryption(
      itemPath,
      password
    );
    testResultSuccess(enableEncryptionResult);
    const encryptedResult = await vault.encrypt(itemPath);
    testResultSuccess(encryptedResult);
    const addTagResult = await vault.editTags(itemPath, newTag, 'add');
    testResultFailure(addTagResult);
  });
});

describeWithSetup('Set watched', () => {
  test('Change link to watched', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const setWatchedResult = vault.setWatched(itemPath, true);
    const watched = testResultSuccess(setWatchedResult);
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
  });

  test('Change watched to link', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const setWatchedResult = vault.setWatched(itemPath, true);
    testResultSuccess(setWatchedResult);
    const setLinkResult = vault.setWatched(itemPath, false);
    const link = testResultSuccess(setLinkResult);
    expect(link.type).toBe('link');
    expect('watched' in link).toBe(false);
  });

  test('Change link to link', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const setLinkResult = vault.setWatched(itemPath, false);
    const link = testResultSuccess(setLinkResult);
    expect(link.type).toBe('link');
    expect('watched' in link).toBe(false);
  });

  test('Change watched to watched', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const setWatchedResult = vault.setWatched(itemPath, true);
    testResultSuccess(setWatchedResult);
    const setWatchedResult2 = vault.setWatched(itemPath, true);
    const watched = testResultSuccess(setWatchedResult2);
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
  });
});

describeWithSetup('Swap priority', () => {
  test('Swap +1', async () => {
    await addItem('link1', 'link', rootPath);
    const { path, item } = await addItem('link2', 'link', rootPath);
    await addItem('link3', 'link', rootPath);
    testResultSuccess(vault.swapPriority(path, 1));
    const parent = testResultSuccess(vault.get(path.slice(0, -1), 'folder'));
    expect(parent.sortedKeys.link[2]).toBe(item.title);
  });

  test('Swap -1', async () => {
    await addItem('link1', 'link', rootPath);
    const { path, item } = await addItem('link2', 'link', rootPath);
    await addItem('link3', 'link', rootPath);
    testResultSuccess(vault.swapPriority(path, -1));
    const parent = testResultSuccess(vault.get(path.slice(0, -1), 'folder'));
    expect(parent.sortedKeys.link[0]).toBe(item.title);
  });

  test('Swap to first position', async () => {
    const addedItems = await Promise.all(
      Array(5).fill(0).map(async (_, i) => {
        return await addItem(`link${i}`, 'link', rootPath);
      })
    );
    const { path, item } = addedItems[4];
    testResultSuccess(vault.swapPriority(path, -Infinity));
    const parent = testResultSuccess(vault.get(path.slice(0, -1), 'folder'));
    expect(parent.sortedKeys.link[0]).toBe(item.title);
  });

  test('Swap to last position', async () => {
    const addedItems = await Promise.all(
      Array(5).fill(0).map(async (_, i) => {
        return await addItem(`link${i}`, 'link', rootPath);
      })
    );
    const { path, item } = addedItems[1];
    testResultSuccess(vault.swapPriority(path, Infinity));
    const parent = testResultSuccess(vault.get(path.slice(0, -1), 'folder'));
    expect(parent.sortedKeys.link[4]).toBe(item.title);
  });
});

describeWithSetup('Set pinned', () => {
  test('Set pinned true', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const setPinnedResult = vault.setPinned(itemPath, true);
    const item = testResultSuccess(setPinnedResult);
    expect(item.pinned).toBe(true);
  });

  test('Set pinned false', async () => {
    const linkTitle = 'linkTitle';
    const itemPath = [ linkTitle ];
    const addResult = await vault.add(createLink(linkTitle), rootPath);
    testResultSuccess(addResult);
    const setPinnedTrueResult = vault.setPinned(itemPath, true);
    testResultSuccess(setPinnedTrueResult);
    const setPinnedFalseResult = vault.setPinned(itemPath, false);
    const item = testResultSuccess(setPinnedFalseResult);
    expect(item.pinned).toBe(false);
  });
});
