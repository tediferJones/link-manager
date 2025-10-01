import {
  afterAll,
  beforeAll,
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

// FIX ME this doesn't actually do anything
// the issue here is that every new Vault shares the same reference to newVault
// make a function that returns a newVault (should make a new reference too)
function describeWithSetup(name: string, func: () => void) {
  describe(name, () => {
    beforeAll(resetVault);
    afterAll(resetVault);
    func();
  });
}

function testResultFailure<T>(result: ResultObj<T>) {
  expect(result.success).toBeFalsy();
  if (!result.success) expect(result.error).toBeTruthy();
}

describeWithSetup('Add item', () => {
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

  beforeAll(async () => {
    await vault.add(createLink(linkTitle), []);
  });

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
    testResultFailure(itemResult);
  });

  // FIX ME should probably make tests for more combos of item types
  // for every type, test that it gets the right item for no type and every other type

  afterAll(async () => {
    await vault.delete([ linkTitle ]);
  });
});

describeWithSetup('Rename item', () => {
  test('Rename existing item', async () => {
    const linkTitle = 'testLink';
    const path: string[] = [];
    const addItemResult = await vault.add(createLink(linkTitle), path);
    expect(addItemResult.success).toBeTruthy();
    if (addItemResult.success) {
      const item = addItemResult.data;
      const newTitle = `${linkTitle}-RENAMED`;
      const renameResult = await vault.rename(newTitle, path.concat(linkTitle));
      expect(renameResult.success).toBeTruthy();
      const renamedItemResult = vault.get(path.concat(newTitle));
      expect(renamedItemResult.success).toBeTruthy();
      if (renamedItemResult.success) expect(renamedItemResult.data).toBe(item);
    }
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
    expect(destinationFolderResult.success).toBeTruthy();
    if (destinationFolderResult.success) {
      const destinationFolder = destinationFolderResult.data;
      expect(
        destinationFolder.sortedKeys['link'].includes(linkTitle)
      ).toBeTruthy();
    }
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
    const path: string[] = [];
    await vault.add(createLink(linkTitle), path);

    const copyResult = await vault.copy([ linkTitle ]);
    expect(copyResult.success).toBeTruthy();
    if (copyResult.success) {
      const itemCopy = copyResult.data;
      expect(itemCopy.title).toBe(`${linkTitle}-COPY`);
    }
  });

  test('Copy with title collision', async () => {
    const linkTitle = 'testLink';
    const path: string[] = [];
    await vault.add(createLink(linkTitle), path);

    const copyResult = await vault.copy([ linkTitle ]);
    expect(copyResult.success).toBeTruthy();
    if (copyResult.success) {
      const itemCopy = copyResult.data;
      expect(itemCopy.title).toBe(`${linkTitle}-COPY-COPY`);
    }
  });

  // FIX ME test if copy will fail after reaching maxAttempt value
  // easy test: pass a lower maxAttempt value or higher attempt start value
});

describeWithSetup('Toggle encryption status', async () => {
  test('Enable encryption', async () => {
    const folderTitle = 'encryptionTest';
    const path: string[] = [];
    await vault.add(createFolder(folderTitle), path);
    const enableEncryptionResult = await vault.enableEncryption(
      [ folderTitle ],
      'password'
    );
    expect(enableEncryptionResult.success).toBeTruthy();
    if (enableEncryptionResult.success) {
      const encrytableFolder = enableEncryptionResult.data;
      expect(encrytableFolder.encryption).toBeDefined();
      expect(encrytableFolder.encryption!.key).toBeDefined();
      expect(encrytableFolder.encryption!.iv).toBeTypeOf('string');
      expect(encrytableFolder.encryption!.salt).toBeTypeOf('string');
    }
  });

  test('Attempt to encrypt non-folder item', async () => {
    const linkTitle = 'testLink';
    const path: string[] = [];
    await vault.add(createLink(linkTitle), path);
    const attemptEncryptResult = await vault.enableEncryption(
      [ linkTitle ],
      'password',
    );
    testResultFailure(attemptEncryptResult);
  });

  test('Disable encryption', async () => {
    const disableEncryptionResult = await vault.disableEncryption(
      [ 'encryptionTest' ]
    );
    expect(disableEncryptionResult.success).toBeTruthy();
    if (disableEncryptionResult.success) {
      const disabledEncryptionFolder = disableEncryptionResult.data;
      expect(disabledEncryptionFolder.encryption).toBeUndefined();
    }
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
  test('Encrypt folder', () => {
    console.log(vault, new Vault());
  });
});
