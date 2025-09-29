import { decrypt, encrypt, getKey, getRandomBase64 } from '@/lib/encryption';
import { compress, decompress } from '@/lib/compression';
import replaceObject from '@/lib/replaceObject';
import asyncReduce from '@/lib/asyncReduce';
import {
  Content,
  ContentTypes,
  Encrypted,
  ResultObj,
  SavedVault,
  SortedKeys,
  SortedKeysHandler,
  SortedKeysTypes,
} from '@/types.ts';

const newVault: Content<'folder'> = {
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
  }
};

// FIX ME move to its own file
const handlers: SortedKeysHandler = {
  folder: {
    add: (dir, item) => {
      dir.sortedKeys.folder.push(item.title);
      dir.sortedKeys.folder.sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      );
    },
    remove: (dir, item) => dir.sortedKeys.folder = dir.sortedKeys.folder.filter(
      folderTitle => folderTitle !== item.title
    ),
  },
  link: {
    add: (dir, item) => dir.sortedKeys.link.unshift(item.title),
    remove: (dir, item) => dir.sortedKeys.link = dir.sortedKeys.link.filter(
      linkTitle => linkTitle !== item.title
    ),
  },
  watched: {
    add: (dir, item) => dir.sortedKeys.watched.unshift(item.title),
    remove: (dir, item) => dir.sortedKeys.watched = dir.sortedKeys.watched.filter(
      watchedTitle => watchedTitle !== item.title
    ),
  },
  pinned: {
    add: (dir, item) => dir.sortedKeys.pinned.push(item.title),
    remove: (dir, item) => dir.sortedKeys.pinned = dir.sortedKeys.pinned.filter(
      pinnedTitle => pinnedTitle !== item.title
    ),
  }
}
const typeMap: { [K in ContentTypes]: SortedKeysTypes } = {
  link: 'link',
  folder: 'folder',
  encryptedFolder: 'folder',
  watched: 'watched',
}

function getItemType(item: Content): SortedKeysTypes {
  if (item.pinned) return 'pinned';
  if (item.type === 'encryptedFolder') return 'folder';
  return item.type;
}

const sortedKeysHandler = {
  add: (sortedKeys: SortedKeys, item: Content) => {
    const key = getItemType(item);
    if (key === 'pinned' || key === 'folder') {
      sortedKeys[key].push(item.title);
    } else {
      sortedKeys[key].unshift(item.title);
    }
    if (key === 'folder') {
      // FIX ME binary insert would be faster
      sortedKeys[key].sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      );
    }
  },
  delete: (sortedKeys: SortedKeys, item: Content) => {
    const key = getItemType(item);
    sortedKeys[key] = sortedKeys[key].filter(title => title !== item.title);
  },
}

// FIX ME rename .ts if we don't reference any components

// FIX ME where possible don't use title to identify resource
// pass the item to the method, and then use Object.assign(item, changedItem)
// this will maintain the reference and allow updates

// This class is getting very large
// consider only keep core functionality in class like add, update, delete, etc...
// for the most part these methods are only called in one place, just write the code in the component
export default class Vault {
  // FIX ME
  // this will make it easier to copy this over to the webpage
  // mode: 'extension' | 'webpage';
  // if we decide vault root cannot be encrypted use this
  // this could also be important for expanding dirs
  // maybe leave it as is until we have that figured out
  // vault: Content<'folder'> | null;
  // FIX ME maybe rename to root, because vault.vault isn't very clear
  root: Content<'folder'>;
  // FIX ME this whole having two separate dirs things just doesn't make much sense
  // rename to path
  // create method getViewPath
  //  - crawl path until item with type 'encryptedDir' is reached, return that array as viewPath
  //  - use this array for decryption and breadcrumbs
  //  - also make sure up arrow will respect viewPath
  //    - if in [ 'encFolder1', 'encFolder2' ], decrypt prompt for 'encFolder1' should be rendered
  //      - if user clicks up arrow, should set currentPath to [], because viewDir will just be [ 'encFolder1' ]
  currentDir: string[];
  // viewDir: string[];
  storageKey = 'userVault';
  // ExpandedDirs type exists in types.ts file
  // expandedDirs: ExpandedDirs

  constructor()  {
    this.root = newVault;
    this.currentDir = [];
    // this.viewDir = [];
    // FIX ME, also use localStorage to store vault and currentDir
    // we would need to keep localStorage, chrome.storage.sync, and the database all in sync
    // but then we wouldn't constantly have to check if vault is null
    this.getVault();
  }

  async getVault() {
    // FIX ME switch to chrome.storage.local with 'unlimitedStorage' permission
    // rename to load

    const chromeStorage = await chrome.storage.sync.get();
    // FIX ME theoretically only using ?. to escape testing errors
    const userVault = chromeStorage?.[this.storageKey];
    if (userVault) {
      const { vault, currentDir }: SavedVault = JSON.parse(
        await decompress(userVault)
      );
      this.root = vault;
      this.currentDir = currentDir;
      // this.viewDir = currentDir;
    }
    this.render();
  }

  getCurrentDir(path = this.currentDir) {
    if (!this.root) return;
    // if (!preserve) this.currentDir = [];
    return path.reduce((folder, title) => {
      if (folder.type === 'encryptedFolder') return folder
      // @ts-ignore
      const nextItem = folder.contents[title];
      if (!nextItem) {
        throw Error(`could not find ${title}`);
      } else if (nextItem.type === 'link') {
        throw Error(`${title} is not a folder`);
      } else if (nextItem.type === 'watched') {
        throw Error(`${title} is not a folder`);
      }
      // if (!preserve) this.currentDir.push(title);
      return nextItem;
    }, this.root as Content<'folder' | 'encryptedFolder'>);
  }

  // getCurrentFolder() {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
  //   return dir;
  // }

  render() {
    const itemResult = this.get(this.currentDir, 'folder', 'encryptedFolder');
    if (!itemResult.success) return itemResult;
    const item = itemResult.data;
    const event = new CustomEvent('render', { detail: item });
    dispatchEvent(event);
  }

  async save() {
    // FIX ME, add package version to saved vault
    // this way if we make breaking changes to vault structure
    // we can apply a function to patch old vaults
    // also add date
    //  - this way we can tell which data is the latest
    //    - if client data is latest push to db
    //    - if server data is latest pull from db
    // also add delay to saving and debounce on next save request
    // chrome.storage.sync is capped at 8kb, could use local storage, but thats capped at 8MB
    // const packed = await this.pack(this.root) as Content<'folder'>;
    const packedResult = await this.packV2();
    if (!packedResult.success) throw Error(packedResult.error)
    const savedVault: SavedVault = {
      vault: packedResult.data,
      currentDir: this.currentDir
    };
    const compressed = await compress(JSON.stringify(savedVault));
    await chrome.storage.sync.set({ [this.storageKey]: compressed });
  }

  // FIX ME, improve types
  // async pack(folder: Content<'folder'>): Promise<Content<'folder' | 'encryptedFolder'>> {
  //   const { encryption, contents, title, tags, sortedKeys, pinned } = folder;
  //   let packedContents = Object.fromEntries(
  //     await Promise.all(
  //       Object.keys(contents).map(async title => {
  //         if (contents[title].type === 'folder') {
  //           return [ title, await this.pack(contents[title]) ];
  //         } else {
  //           return [ title, contents[title] ];
  //         }
  //       })
  //     )
  //   );
  //   if (encryption) {
  //     console.log('encrypted', packedContents)
  //     const toEncrypt: Encrypted = {
  //       contents: packedContents,
  //       tags,
  //       sortedKeys,
  //     }
  //     return {
  //       type: 'encryptedFolder',
  //       title,
  //       pinned,
  //       data: await encrypt(
  //         JSON.stringify(toEncrypt),
  //         encryption.key,
  //         encryption.iv,
  //       ),
  //       salt: encryption.salt,
  //       iv: encryption.iv,
  //     }
  //   } else {
  //     return {
  //       ...folder,
  //       contents: packedContents,
  //     }
  //   }
  // }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  // FIX ME this is essentially just an add action and remove action
  // move(title: string, newPath: string[]) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
  //   const item = dir.contents[title];
  //   this.modifySortedKeys(dir, 'remove', item);
  //   const newDir = this.getCurrentDir(newPath, 'preserve');
  //   if (!newDir) throw Error('dir is null');
  //   if (newDir.type === 'encryptedFolder') throw Error('dir is encrypted');
  //   if (newDir.contents[title]) throw Error('title already exists in new dir');
  //   newDir.contents[title] = item;
  //   delete dir.contents[title];
  //   this.modifySortedKeys(newDir, 'add', item);
  //   this.saveAndRender();
  // }

  // copyItem(title: string) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
  //   const item = dir.contents[title];
  //   if (!item) throw Error('item not found');
  //   const itemCopy: Content = JSON.parse(JSON.stringify(item));
  //   itemCopy.title = `${item.title}-COPY`;
  //   this.insertItem(dir, itemCopy);
  //   this.saveAndRender();
  // }

  // insertItem(folder: Content<'folder'>, item: Content) {
  //   if (folder.contents[item.title]) throw Error('name already exists');
  //   folder.contents[item.title] = item;
  //   this.modifySortedKeys(folder, 'add', item);
  // }

  // FIX ME or delete, how do we figure out what prop of sorted keys belongs to?
  // i.e. if title is for a folder, link, or watched
  // if deleted, delete types from types.ts too
  modifySortedKeys(
    dir: Content<'folder'>,
    action: 'add' | 'remove',
    item: Content,
  ) {
    const type = item.pinned ? 'pinned' : typeMap[item.type];
    handlers[type][action](dir, item);
  }

  // FIX ME, rename to enableEncryption
  // also create method to disableEncryption
  // then make encryptFolder method whose sole purpose to turn Content<'folder'> in Content<'encryptedFolder'>
  // async encryptFolder(folder: Content<'folder'>, password: string) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'folder') {
  //     throw Error('dir is already encrypted');
  //   }
  //   const iv = getRandomBase64('iv');
  //   const salt = getRandomBase64('salt');
  //   const key = await getKey(password, salt);
  //   folder.encryption = { key, salt, iv };
  //   console.log(password, salt, iv)
  //   this.saveAndRender();
  // }

  // async decryptFolder(password: string) {
  //   // FIX ME this is a bit of a mess try to clean it up
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'encryptedFolder') {
  //     throw Error('dir is already decrypted');
  //   }
  //   const { iv, salt, data } = dir;
  //   const key = await getKey(password, salt);
  //   const decryptedData: Encrypted = JSON.parse(
  //     await decrypt(data, key, iv)
  //   );
  //   console.log('decrypted data', decryptedData)
  //   const newIv = getRandomBase64('iv');
  //   const newSalt = getRandomBase64('salt');
  //   const newKey = await getKey(password, newSalt);
  //   const decryptedFolder: Content<'folder'> = {
  //     type: 'folder',
  //     title: dir.title,
  //     pinned: dir.pinned,
  //     ...decryptedData,
  //     encryption: {
  //       key: newKey,
  //       salt: newSalt,
  //       iv: newIv,
  //     }
  //   }
  //   const { parentDir, current } = this.getParent();
  //   if (!parentDir) throw Error('parent dir is null');
  //   if (parentDir.type !== 'folder') throw Error('parent dir is not a folder');
  //   parentDir.contents[current] = decryptedFolder;
  //   this.render();
  // }

  // async recryptFolder(title: string) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'folder') throw Error('dir is encrypted');
  //   const folder = dir.contents[title];
  //   if (folder.type !== 'folder') throw Error('item is not a folder');
  //   if (!folder.encryption) throw Error('folder is not already encrypted');
  //   const { encryption, contents, pinned } = folder;
  //   const encrypted: Content<'encryptedFolder'> = {
  //     type: 'encryptedFolder',
  //     title,
  //     pinned, 
  //     data: await encrypt(
  //       JSON.stringify(contents),
  //       encryption.key,
  //       encryption.iv
  //     ),
  //     salt: encryption.salt,
  //     iv: encryption.iv,
  //   }
  //   dir.contents[title] = encrypted;
  //   this.render();
  // }

  // FIX ME, this needs to update folder.sortedKeys
  // delete(title: string) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'folder') throw Error('dir is encrypted');
  //   delete dir.contents[title];
  //   this.saveAndRender();
  // }

  // FIX ME, this needs to update folder.sortedKeys
  // also needs to check for name collision
  // rename(title: string, newTitle: string): ResultObj<undefined> {
  //   const folder = this.getCurrentFolder();
  //   if (folder.contents[newTitle]) {
  //     return { success: false, error: 'Title already exists' }
  //   }
  //   const item = folder.contents[title];
  //   this.modifySortedKeys(folder, 'remove', item);
  //   item.title = newTitle;
  //   folder.contents[newTitle] = item;
  //   this.modifySortedKeys(folder, 'add', item);
  //   delete folder.contents[title];
  //   this.saveAndRender();
  //   return { success: true, data: undefined };
  // }

  // getParent() {
  //   const parentPath = this.currentDir.slice(0, -1);
  //   const [ current ] = this.currentDir.slice(-1);
  //   const parentDir = this.getCurrentDir(parentPath);
  //   return { parentDir, parentPath, current };
  // }

  setDir(keys: string[]) {
    this.currentDir = keys;
    // this.viewDir = keys;
    this.saveAndRender();
  }

  // FIX ME
  // if we never actually pass multiple strings to addTags or removeTags just make it a single string
  // while we're at it, rename to addTag and removeTag
  addTags(title: string, tags: string[]) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    if (dir.contents[title].type === 'encryptedFolder') {
      throw Error('item is encrypted');
    }
    const existingTags = dir.contents[title].tags;
    existingTags.push(
      ...tags.filter(newTag => !existingTags.includes(newTag))
    );
    this.saveAndRender();
  }

  removeTags(title: string, tags: string[]) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    if (dir.contents[title].type === 'encryptedFolder') {
      throw Error('item is encrypted');
    }
    dir.contents[title].tags = dir.contents[title].tags.filter(
      extTag => !tags.includes(extTag)
    );
    this.saveAndRender();
  }

  // use for auto-complete of new tags
  getExistingTags(parent = this.root, tags = new Set<string>()) {
    // if (!parent) throw Error('vault is null');
    // if (parent.type === 'encryptedFolder') return;
    Object.keys(parent.contents).forEach(title => {
      const item = parent.contents[title];
      if (item.type === 'encryptedFolder') return;
      item.tags.forEach(tag => tags.add(tag));
      if (item.type === 'folder') {
        this.getExistingTags(item, tags);
      }
    });
    return [ ...tags ];
  }

  toggleWatched(item: Content<'link' | 'watched'>) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    if (item.type === 'link') {
      const watched: Content<'watched'> = {
        ...item,
        type: 'watched',
        watched: Date.now(),
      }
      if (!item.pinned) this.modifySortedKeys(dir, 'remove', item);
      Object.assign(item, watched);
      if (!item.pinned) this.modifySortedKeys(dir, 'add', item);
    } else if (item.type === 'watched') {
      const { watched, ...rest } = item;
      const link: Content<'link'> = {
        // FIX ME typescript won't throw an error if we try do do this
        // but it should because we are spreading watched into a link
        // ...item,
        ...rest,
        type: 'link'
      }
      if (!item.pinned) this.modifySortedKeys(dir, 'remove', item);
      Object.assign(item, link);
      if (!item.pinned) this.modifySortedKeys(dir, 'add', item);
    }
    // if (!item.pinned) {
    //   this.modifySortedKeys(dir, 'remove', item);
    //   this.modifySortedKeys(dir, 'add', item);
    // }
    this.saveAndRender();
  }

  // new setup, lowest is 0 (top of list), highest is sortedKeys.links.length -1 (bottom of list)
  // to move an item to first or last, just enter diff of Infinity or -Infinity
  swapPriority(title: string, diff: number) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    const linkIndex = dir.sortedKeys.link.findIndex(
      linkTitle => linkTitle === title
    );
    let newIndex = linkIndex + diff;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= dir.sortedKeys.link.length) {
      newIndex = dir.sortedKeys.link.length - 1;
    }
    if (newIndex === linkIndex) return;
    [
      dir.sortedKeys.link[linkIndex],
      dir.sortedKeys.link[newIndex],
    ] = [
        dir.sortedKeys.link[newIndex],
        dir.sortedKeys.link[linkIndex],
      ];
    this.saveAndRender();
  }

  setPinned(title: string, pinned: boolean) {
    // FIX ME swapping priority of a pinned item causes rendering issues
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    const item = dir.contents[title];
    this.modifySortedKeys(dir, 'remove', item);
    item.pinned = pinned;
    this.modifySortedKeys(dir, 'add', item);
    this.saveAndRender();
  }

  // FIX ME
  // START REFACTOR

  get<T extends ContentTypes>(
    path: string[],
    ...types: T[]
  ): ResultObj<Content<T>> {
    const newViewDir: string[] = [];
    const item = path.reduce<Content | undefined>((item, title) => {
      if (!item) return undefined;
      if (item.type === 'encryptedFolder') return item;
      if (item.type !== 'folder') return undefined;
      newViewDir.push(title);
      return item.contents[title];
    }, this.root as Content);

    if (!item) {
      return {
        success: false,
        error: `Could not find item at: ${path.join('/')}`,
      }
    }

    if (types.length && !types.includes(item.type as T)) {
      const expected = types.join(', ');
      return {
        success: false,
        error: `Item type is ${item.type}, expected: ${expected}`,
      }
    }
    return { success: true, data: item as Content<T> };
  }

  async add(
    item: Content,
    path: string[]
  ): Promise<ResultObj<Content>> {
    const parentResult = this.get(path, 'folder');
    if (!parentResult.success) return parentResult;
    const parent = parentResult.data;
    if (parent.contents[item.title]) {
      return { success: false, error: 'Title already used' };
    }
    parent.contents[item.title] = item;
    sortedKeysHandler.add(parent.sortedKeys, item);
    await this.saveAndRender();
    return { success: true, data: item };
  }

  async delete(path: string[]): Promise<ResultObj<Content>> {
    const parentPath = path.slice(0, -1);
    const itemTitle = path[path.length - 1];

    const parentResult = this.get(parentPath, 'folder');
    if (!parentResult.success) return parentResult;
    const parent = parentResult.data;

    const itemResult = this.get(path);
    if (!itemResult.success) return itemResult;
    const item = itemResult.data;

    sortedKeysHandler.delete(parent.sortedKeys, item);
    delete parent.contents[itemTitle];
    await this.saveAndRender();
    return { success: true, data: item };
  }

  async rename(newTitle: string, path: string[]): Promise<ResultObj<Content>> {
    const parentResult = this.get(path.slice(0, -1), 'folder');
    if (!parentResult.success) return parentResult;
    const parent = parentResult.data;

    const deleteResult = await this.delete(path);
    if (!deleteResult.success) return deleteResult;
    const item = deleteResult.data;
    sortedKeysHandler.delete(parent.sortedKeys, item);

    item.title = newTitle;
    const addResult = await this.add(item, path.slice(0, -1));
    if (!addResult.success) return addResult;
    const addedItem = addResult.data;
    sortedKeysHandler.add(parent.sortedKeys, addedItem);

    return { success: true, data: item };
  }

  async move(path: string[], newPath: string[]): Promise<ResultObj<Content>> {
    const itemResult = this.get(path);
    if (!itemResult.success) return itemResult;
    const item = itemResult.data;

    const addResult = await this.add(item, newPath);
    if (!addResult.success) return addResult;

    const deleteResult = await this.delete(path);
    if (!deleteResult.success) return deleteResult;

    return { success: true, data: item };
  }

  // FIX ME do we really need a maxAttempt value?
  // there is no max title length, so eventually there will be a valid title
  async copy(
    path: string[],
    attempt = 1,
    maxAttempt = 64
  ): Promise<ResultObj<Content>> {
    const itemResult = this.get(path);
    if (!itemResult.success) return itemResult;
    const item = itemResult.data;

    const itemCopy: typeof item = JSON.parse(JSON.stringify(item));
    itemCopy.title = `${item.title}${'-COPY'.repeat(attempt)}`;

    const addResult = await this.add(itemCopy, path.slice(0, -1));
    if (!addResult.success && attempt < maxAttempt) {
      return this.copy(path, attempt + 1);
    };
    return addResult;
  }

  async enableEncryption(
    path: string[],
    password: string
  ): Promise<ResultObj<Content<'folder'>>> {
    const folderResult = this.get(path, 'folder');
    if (!folderResult.success) return folderResult;
    const folder = folderResult.data;
    const iv = getRandomBase64('iv');
    const salt = getRandomBase64('salt');
    const key = await getKey(password, salt);
    folder.encryption = { key, salt, iv };
    await this.saveAndRender();
    return { success: true, data: folder };
  }

  async disableEncryption(
    path: string[]
  ): Promise<ResultObj<Content<'folder'>>> {
    const folderResult = this.get(path, 'folder');
    if (!folderResult.success) return folderResult;
    const folder = folderResult.data;
    delete folder.encryption;
    await this.saveAndRender();
    return { success: true, data: folder };
  }

  async encrypt(
    path: string[],
    preserve?: 'preserve',
  ): Promise<ResultObj<Content<'encryptedFolder'>>> {
    const folderResult = this.get(path, 'folder');
    if (!folderResult.success) return folderResult;
    const folder = folderResult.data;
    if (!folder.encryption) {
      return {
        success: false,
        error: `Folder ${path.join('/')} does not have encryption enabled`,
      }
    }

    const { encryption, contents, pinned, title, tags, sortedKeys } = folder;

    const packedContents = await asyncReduce(
      Object.keys(contents),
      async (packedContents, title) => {
        const item = contents[title];
        if (item.type === 'folder') {
          const encryptResult = await this.encrypt(path.concat(title), preserve);
          if (!encryptResult.success) throw Error(encryptResult.error);
          packedContents[title] = encryptResult.data;
        } else {
          packedContents[title] = item;
        }
        return packedContents;
      },
      {} as Content<'folder'>['contents']
    );

    const toEncrypt: Encrypted = {
      contents: packedContents,
      tags,
      sortedKeys,
    }

    const encryptedFolder: Content<'encryptedFolder'> = {
      type: 'encryptedFolder',
      title,
      pinned, 
      data: await encrypt(
        JSON.stringify(toEncrypt),
        encryption.key,
        encryption.iv
      ),
      salt: encryption.salt,
      iv: encryption.iv,
    }
    if (!preserve) replaceObject(folder, encryptedFolder);
    this.render();
    return { success: true, data: encryptedFolder };
  }

  // FIX ME does not preserve directory for nested encrypted folders
  // i.e. if currentDir is [ 'encFolder1', 'encFolder2' ]
  // after decrypting 'encFolder1' currentDir is set to 'encFolder1'
  // we want the preserver currentDir until use manually navigates away
  async decrypt(
    path: string[],
    password: string
  ): Promise<ResultObj<Content<'folder'>>> {
    const encryptedFolderResult = this.get(path, 'encryptedFolder');
    if (!encryptedFolderResult.success) return encryptedFolderResult;
    const encryptedFolder = encryptedFolderResult.data;
    const { iv, salt, data } = encryptedFolder;
    const key = await getKey(password, salt);
    let decryptedData: Encrypted;
    try {
      decryptedData = JSON.parse(await decrypt(data, key, iv));
    } catch {
      return { success: false, error: 'Failed to decrypt' }
    }
    const newIv = getRandomBase64('iv');
    const newSalt = getRandomBase64('salt');
    const newKey = await getKey(password, newSalt);
    const decryptedFolder: Content<'folder'> = {
      type: 'folder',
      title: encryptedFolder.title,
      pinned: encryptedFolder.pinned,
      ...decryptedData,
      encryption: {
        key: newKey,
        salt: newSalt,
        iv: newIv,
      },
    }
    replaceObject(encryptedFolder, decryptedFolder);
    this.render();
    return { success: true, data: decryptedFolder };
  }

  async packV2(path: string[] = []): Promise<ResultObj<Content<'folder'>>> {
    const folderResult = this.get(path, 'folder');
    if (!folderResult.success) return folderResult;
    const folder = folderResult.data;
    
    const packedContents = Object.fromEntries(
      await Promise.all(
        Object.keys(folder.contents).map(async (title) => {
          const item = folder.contents[title];
          if (item.type === 'folder' && item.encryption) {
            const encryptResult = await this.encrypt(
              path.concat(title),
              'preserve'
            );
            if (!encryptResult.success) throw Error(encryptResult.error);
            return [ title, encryptResult.data ];
          } else if (item.type === 'folder') {
            const packResult = await this.packV2(path.concat(title));
            if (!packResult.success) throw Error(packResult.error);
            return [ title, packResult.data ];
          } else {
            return [ title, item ];
          }
        })
      )
    );

    return {
      success: true,
      data: {
        ...folder,
        contents: packedContents,
      }
    }
  }
}
