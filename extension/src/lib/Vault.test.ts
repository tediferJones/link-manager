import {
  beforeEach,
  afterEach,
  describe,
  expect,
  test
} from 'vitest';
import Vault from '@/lib/Vault';
import { Content, ResultObj } from '@/types';

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

// FIX ME write function to populate a vault with some generic items
// add one of every type
// add at least one folder with nested items
// add as least one encrypted folder with nested items
// reset vault after each describe
// const vault = new Vault();
let vault: Vault;
function resetVault() {
  vault = new Vault();
}

const rootPath: string[] = [];
const password = 'password';

// FIX ME this doesn't actually do anything
// the issue here is that every new Vault shares the same reference to newVault
// make a function that returns a newVault (should make a new reference too)
function describeWithSetup(name: string, func: () => void) {
  describe(name, () => {
    beforeEach(resetVault);
    afterEach(resetVault);
    func();
  });
}

function testResultFailure<T>(result: ResultObj<T>) {
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toBeTruthy();
}

function testResultSuccess<T>(result: ResultObj<T>): T {
  expect(result.success).toBe(true);
  if (!result.success) throw Error();
  return result.data;
}

describeWithSetup('Add item', () => {
  const linkTitle = 'testLink';
  const testLink = createLink('testLink');
  test('Add item to vault', async () => {
    const addResult = await vault.add(testLink, rootPath);
    expect(addResult.success).toBeTruthy();
    if (addResult.success) expect(addResult.data).toBe(testLink);
    expect(vault.root.contents[linkTitle]).toBe(testLink);
    // FIX ME replace .includes checks with .toContain or .not.toContain
    expect(vault.root.sortedKeys.link.includes(linkTitle)).toBeTruthy();
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
    expect(vault.root.sortedKeys.link.includes(linkTitle)).toBeFalsy();
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
    expect(itemResult.success).toBeTruthy();
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
    expect(vault.root.sortedKeys.link.includes(linkTitle)).toBeFalsy();
    const destinationFolderResult = vault.get([ folderTitle ], 'folder');
    const destinationFolder = testResultSuccess(destinationFolderResult);
    expect(
      destinationFolder.sortedKeys['link'].includes(linkTitle)
    ).toBe(true);
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
