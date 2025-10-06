import { decrypt, encrypt, getKey, getRandomBase64 } from '@/lib/encryption';
import { compress, decompress } from '@/lib/compression';
import replaceObject from '@/lib/replaceObject';
import asyncReduce from '@/lib/asyncReduce';
// import throwOnFail from '@/lib/throwOnFail';
// import returnOnFail from '@/lib/returnOnFail';
import getNewVault from '@/lib/getNewVault';
import Result from '@/lib/Result';
import {
  Actions,
  Content,
  ContentTypes,
  Encrypted,
  // ResultObj,
  SavedVault,
  SortedKeys,
  SortedKeysTypes,
  TagHandler,
} from '@/types.ts';

function getItemType(item: Content): SortedKeysTypes {
  if (item.pinned) return 'pinned';
  if (item.type === 'encryptedFolder') return 'folder';
  return item.type;
}

// FIX ME move to its own file
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
  move: (sortedKeys: SortedKeys, item: Content, diff: number) => {
    const key = getItemType(item);
    const currentIndex = sortedKeys[key].indexOf(item.title);
    let newIndex = currentIndex + diff;
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex > sortedKeys[key].length) {
      newIndex = sortedKeys[key].length - 1;
    }
    [ 
      sortedKeys[key][currentIndex],
      sortedKeys[key][newIndex],
    ] = [
        sortedKeys[key][newIndex],
        sortedKeys[key][currentIndex],
      ];
  }
}

// FIX ME move to its own file
const tagHandler: TagHandler = {
  add: (tags, inputTag) => (
    tags.includes(inputTag) ? tags : tags.concat(inputTag)
  ),
  delete: (tags, inputTag) => tags.filter(tag => tag !== inputTag),
};


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
  root: Content<'folder'>;
  path: string[];
  storageKey = 'userVault';
  // ExpandedDirs type exists in types.ts file
  // expandedDirs: ExpandedDirs

  constructor()  {
    this.root = getNewVault();
    this.path = [];
    this.getVault();
  }

  async getVault() {
    // FIX ME 
    // rename to load
    //
    // new storage strategy:
    // data is only stored in chrome.storage.local and database
    // switch to chrome.storage.local with 'unlimitedStorage' permission
    //  - chrome.storage.local allows for communication between content script and extension

    const chromeStorage = await chrome.storage.sync.get();
    // FIX ME theoretically only using ?. to escape testing errors
    const userVault = chromeStorage?.[this.storageKey];
    if (userVault) {
      const { vault, path }: SavedVault = JSON.parse(
        await decompress(userVault)
      );
      this.root = vault;
      this.path = path;
    }
    this.render();
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
    const packed = (await this.pack()).throw().data();
    const savedVault: SavedVault = {
      vault: packed,
      path: this.path,
    };
    const compressed = await compress(JSON.stringify(savedVault));
    await chrome.storage.sync.set({ [this.storageKey]: compressed });
  }

  render() {
    const item = this.get(
      this.path,
      'folder',
      'encryptedFolder'
    ).throw().data();
    const event = new CustomEvent('render', { detail: item });
    dispatchEvent(event);
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  setDir(keys: string[]) {
    this.path = keys;
    this.saveAndRender();
  }

  // FIX ME
  // if we never actually pass multiple strings to addTags or removeTags just make it a single string
  // while we're at it, rename to addTag and removeTag
  // addTags(title: string, tags: string[]) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'folder') throw Error('dir is encrypted');
  //   if (dir.contents[title].type === 'encryptedFolder') {
  //     throw Error('item is encrypted');
  //   }
  //   const existingTags = dir.contents[title].tags;
  //   existingTags.push(
  //     ...tags.filter(newTag => !existingTags.includes(newTag))
  //   );
  //   this.saveAndRender();
  // }

  // removeTags(title: string, tags: string[]) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'folder') throw Error('dir is encrypted');
  //   if (dir.contents[title].type === 'encryptedFolder') {
  //     throw Error('item is encrypted');
  //   }
  //   dir.contents[title].tags = dir.contents[title].tags.filter(
  //     extTag => !tags.includes(extTag)
  //   );
  //   this.saveAndRender();
  // }

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

  // toggleWatched(item: Content<'link' | 'watched'>) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
  //   if (item.type === 'link') {
  //     const watched: Content<'watched'> = {
  //       ...item,
  //       type: 'watched',
  //       watched: Date.now(),
  //     }
  //     if (!item.pinned) this.modifySortedKeys(dir, 'remove', item);
  //     Object.assign(item, watched);
  //     if (!item.pinned) this.modifySortedKeys(dir, 'add', item);
  //   } else if (item.type === 'watched') {
  //     const { watched, ...rest } = item;
  //     const link: Content<'link'> = {
  //       // FIX ME typescript won't throw an error if we try do do this
  //       // but it should because we are spreading watched into a link
  //       // ...item,
  //       ...rest,
  //       type: 'link'
  //     }
  //     if (!item.pinned) this.modifySortedKeys(dir, 'remove', item);
  //     Object.assign(item, link);
  //     if (!item.pinned) this.modifySortedKeys(dir, 'add', item);
  //   }
  //   // if (!item.pinned) {
  //   //   this.modifySortedKeys(dir, 'remove', item);
  //   //   this.modifySortedKeys(dir, 'add', item);
  //   // }
  //   this.saveAndRender();
  // }

  // new setup, lowest is 0 (top of list), highest is sortedKeys.links.length -1 (bottom of list)
  // to move an item to first or last, just enter diff of Infinity or -Infinity
  // swapPriority(title: string, diff: number) {
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
  //   const linkIndex = dir.sortedKeys.link.findIndex(
  //     linkTitle => linkTitle === title
  //   );
  //   let newIndex = linkIndex + diff;
  //   if (newIndex < 0) newIndex = 0;
  //   if (newIndex >= dir.sortedKeys.link.length) {
  //     newIndex = dir.sortedKeys.link.length - 1;
  //   }
  //   if (newIndex === linkIndex) return;
  //   [
  //     dir.sortedKeys.link[linkIndex],
  //     dir.sortedKeys.link[newIndex],
  //   ] = [
  //       dir.sortedKeys.link[newIndex],
  //       dir.sortedKeys.link[linkIndex],
  //     ];
  //   this.saveAndRender();
  // }

  // setPinned(title: string, pinned: boolean) {
  //   // FIX ME swapping priority of a pinned item causes rendering issues
  //   const dir = this.getCurrentDir();
  //   if (!dir) throw Error('dir is null');
  //   if (dir.type !== 'folder') throw Error('dir is encrypted');
  //   const item = dir.contents[title];
  //   this.modifySortedKeys(dir, 'remove', item);
  //   item.pinned = pinned;
  //   this.modifySortedKeys(dir, 'add', item);
  //   this.saveAndRender();
  // }

  // FIX ME
  // decide if path should always be first or last argument
  // START REFACTOR

  // get<T extends ContentTypes>(
  //   path: string[],
  //   ...types: T[]
  // ): ResultObj<Content<T>> {
  //   const item = path.reduce<Content | undefined>((item, title) => {
  //     if (!item) return undefined;
  //     if (item.type === 'encryptedFolder') return item;
  //     if (item.type !== 'folder') return undefined;
  //     return item.contents[title];
  //   }, this.root as Content);

  //   if (!item) {
  //     return {
  //       success: false,
  //       error: `Could not find item at: ${path.join('/')}`,
  //     }
  //   }

  //   if (types.length && !types.includes(item.type as T)) {
  //     const expected = types.join(', ');
  //     return {
  //       success: false,
  //       error: `Item type is ${item.type}, expected: ${expected}`,
  //     }
  //   }
  //   return { success: true, data: item as Content<T> };
  // }

  // FIX ME
  // Ideally this should look like this:
  //
  // async add<T extends 'link' | 'folder'>(
  //   item: Content<T>,
  //   path: string[]
  // ): Promise<ResultObj<Content<T>>> {
  // async add(
  //   item: Content,
  //   path: string[]
  // ): Promise<ResultObj<Content>> {
  //   const parentResult = this.get(path, 'folder');
  //   if (!parentResult.success) return parentResult;
  //   const parent = parentResult.data;
  //   if (parent.contents[item.title]) {
  //     return { success: false, error: 'Title already used' };
  //   }
  //   parent.contents[item.title] = item;
  //   sortedKeysHandler.add(parent.sortedKeys, item);
  //   await this.saveAndRender();
  //   return { success: true, data: item };
  // }

  // async delete(path: string[]): Promise<ResultObj<Content>> {
  //   const parentPath = path.slice(0, -1);
  //   const itemTitle = path[path.length - 1];

  //   const parentResult = this.get(parentPath, 'folder');
  //   if (!parentResult.success) return parentResult;
  //   const parent = parentResult.data;

  //   const itemResult = this.get(path);
  //   if (!itemResult.success) return itemResult;
  //   const item = itemResult.data;

  //   sortedKeysHandler.delete(parent.sortedKeys, item);
  //   delete parent.contents[itemTitle];
  //   await this.saveAndRender();
  //   return { success: true, data: item };
  // }

  // async rename(newTitle: string, path: string[]): Promise<ResultObj<Content>> {
  //   const parentResult = this.get(path.slice(0, -1), 'folder');
  //   if (!parentResult.success) return parentResult;
  //   const parent = parentResult.data;

  //   const deleteResult = await this.delete(path);
  //   if (!deleteResult.success) return deleteResult;
  //   const item = deleteResult.data;
  //   sortedKeysHandler.delete(parent.sortedKeys, item);

  //   item.title = newTitle;
  //   const addResult = await this.add(item, path.slice(0, -1));
  //   if (!addResult.success) return addResult;
  //   const addedItem = addResult.data;
  //   sortedKeysHandler.add(parent.sortedKeys, addedItem);

  //   return { success: true, data: item };
  // }

  // async move(path: string[], newPath: string[]): Promise<ResultObj<Content>> {
  //   const itemResult = this.get(path);
  //   if (!itemResult.success) return itemResult;
  //   const item = itemResult.data;

  //   const addResult = await this.add(item, newPath);
  //   if (!addResult.success) return addResult;

  //   const deleteResult = await this.delete(path);
  //   if (!deleteResult.success) return deleteResult;

  //   return { success: true, data: item };
  // }

  // async copy(
  //   path: string[],
  //   attempt = 1
  // ): Promise<ResultObj<Content>> {
  //   const itemResult = this.get(path);
  //   if (!itemResult.success) return itemResult;
  //   const item = itemResult.data;

  //   const itemCopy: typeof item = JSON.parse(JSON.stringify(item));
  //   itemCopy.title = `${item.title}${'-COPY'.repeat(attempt)}`;

  //   const addResult = await this.add(itemCopy, path.slice(0, -1));
  //   if (!addResult.success) {
  //     return this.copy(path, attempt + 1);
  //   };
  //   return addResult;
  // }

  // async enableEncryption(
  //   path: string[],
  //   password: string
  // ): Promise<ResultObj<Content<'folder'>>> {
  //   const folderResult = this.get(path, 'folder');
  //   if (!folderResult.success) return folderResult;
  //   const folder = folderResult.data;
  //   const iv = getRandomBase64('iv');
  //   const salt = getRandomBase64('salt');
  //   const key = await getKey(password, salt);
  //   folder.encryption = { key, salt, iv };
  //   await this.saveAndRender();
  //   return { success: true, data: folder };
  // }

  // async disableEncryption(
  //   path: string[]
  // ): Promise<ResultObj<Content<'folder'>>> {
  //   const folderResult = this.get(path, 'folder');
  //   if (!folderResult.success) return folderResult;
  //   const folder = folderResult.data;
  //   if (!folder.encryption) {
  //     return {
  //       success: false,
  //       error: 'Item does not have encryption enabled'
  //     }
  //   }
  //   delete folder.encryption;
  //   await this.saveAndRender();
  //   return { success: true, data: folder };
  // }

  // async encrypt(
  //   path: string[],
  //   preserve?: 'preserve',
  // ): Promise<ResultObj<Content<'encryptedFolder'>>> {
  //   const folderResult = this.get(path, 'folder');
  //   if (!folderResult.success) return folderResult;
  //   const folder = folderResult.data;
  //   if (!folder.encryption) {
  //     return {
  //       success: false,
  //       error: `Folder ${path.join('/')} does not have encryption enabled`,
  //     }
  //   }

  //   const { encryption, contents, pinned, title, tags, sortedKeys } = folder;

  //   const packedContents = await asyncReduce(
  //     Object.keys(contents),
  //     async (packedContents, title) => {
  //       const item = contents[title];
  //       if (item.type === 'folder' && item.encryption) {
  //         const encrypted = throwOnFail(
  //           await this.encrypt(path.concat(title), preserve)
  //         );
  //         packedContents[title] = encrypted;
  //       } else {
  //         packedContents[title] = item;
  //       }
  //       return packedContents;
  //     },
  //     {} as Content<'folder'>['contents']
  //   );

  //   const toEncrypt: Encrypted = {
  //     contents: packedContents,
  //     tags,
  //     sortedKeys,
  //   }

  //   const encryptedFolder: Content<'encryptedFolder'> = {
  //     type: 'encryptedFolder',
  //     title,
  //     pinned, 
  //     data: await encrypt(
  //       JSON.stringify(toEncrypt),
  //       encryption.key,
  //       encryption.iv
  //     ),
  //     salt: encryption.salt,
  //     iv: encryption.iv,
  //   }
  //   if (!preserve) replaceObject(folder, encryptedFolder);
  //   this.render();
  //   return { success: true, data: encryptedFolder };
  // }

  // FIX ME does not preserve directory for nested encrypted folders
  // i.e. if currentDir is [ 'encFolder1', 'encFolder2' ]
  // after decrypting 'encFolder1' currentDir is set to 'encFolder1'
  // we want the preserver currentDir until use manually navigates away
  // async decrypt(
  //   path: string[],
  //   password: string
  // ): Promise<ResultObj<Content<'folder'>>> {
  //   const encryptedFolderResult = this.get(path, 'encryptedFolder');
  //   if (!encryptedFolderResult.success) return encryptedFolderResult;
  //   const encryptedFolder = encryptedFolderResult.data;
  //   const { iv, salt, data } = encryptedFolder;
  //   const key = await getKey(password, salt);
  //   let decryptedData: Encrypted;
  //   try {
  //     decryptedData = JSON.parse(await decrypt(data, key, iv));
  //   } catch {
  //     return { success: false, error: 'Failed to decrypt' };
  //   }
  //   const newIv = getRandomBase64('iv');
  //   const newSalt = getRandomBase64('salt');
  //   const newKey = await getKey(password, newSalt);
  //   const decryptedFolder: Content<'folder'> = {
  //     type: 'folder',
  //     title: encryptedFolder.title,
  //     pinned: encryptedFolder.pinned,
  //     ...decryptedData,
  //     encryption: {
  //       key: newKey,
  //       salt: newSalt,
  //       iv: newIv,
  //     },
  //   }
  //   replaceObject(encryptedFolder, decryptedFolder);
  //   this.render();
  //   return { success: true, data: decryptedFolder };
  // }

  // async pack(path: string[] = []): Promise<ResultObj<Content<'folder'>>> {
  //   const folderResult = this.get(path, 'folder');
  //   if (!folderResult.success) return folderResult;
  //   const folder = folderResult.data;
  //   
  //   // FIX ME try to use asyncReduce
  //   // write tests first so we can verify async reduce works as expected
  //   const packedContents = Object.fromEntries(
  //     await Promise.all(
  //       Object.keys(folder.contents).map(async (title) => {
  //         const item = folder.contents[title];
  //         if (item.type === 'folder' && item.encryption) {
  //           const encrypted = throwOnFail(
  //             await this.encrypt(path.concat(title), 'preserve')
  //           );
  //           return [ title, encrypted ];
  //         } else if (item.type === 'folder') {
  //           const packed = throwOnFail(await this.pack(path.concat(title)));
  //           return [ title, packed ];
  //         } else {
  //           return [ title, item ];
  //         }
  //       })
  //     )
  //   );

  //   return {
  //     success: true,
  //     data: {
  //       ...folder,
  //       contents: packedContents,
  //     }
  //   }
  // }

  // FIX ME
  // make action second arg
  // make tags a spread arg so multiple tags can be added or deleted at once
  // async editTags(
  //   path: string[],
  //   tag: string,
  //   action: Actions,
  // ): Promise<ResultObj<Content<'folder' | 'link' | 'watched'>>> {
  //   const itemResult = this.get(path, 'folder', 'link', 'watched');
  //   if (!itemResult.success) return itemResult;
  //   const item = itemResult.data;
  //   item.tags = tagHandler[action](item.tags, tag);
  //   await this.saveAndRender();
  //   return { success: true, data: item };
  // }

  // maybe change to toggleWatched, second arg could be force: boolean
  // if no force arg is includes just toggle, otherwise set to value of force
  // setWatched(
  //   path: string[],
  //   val: boolean,
  // ): ResultObj<Content<'link' | 'watched'>> {
  //   return returnOnFail(
  //     this.get(path, 'link', 'watched'),
  //     (item) => returnOnFail(
  //       this.get(path.slice(0, -1), 'folder'),
  //       (parent) => {
  //         if (item.type === 'watched' && val === false) {
  //           const { watched, ...rest } = item;
  //           const link: Content<'link'> = {
  //             ...rest,
  //             type: 'link',
  //           }
  //           if (!item.pinned) sortedKeysHandler.delete(parent.sortedKeys, item);
  //           replaceObject(item, link);
  //           if (!item.pinned) sortedKeysHandler.add(parent.sortedKeys, link);
  //         } else if (item.type === 'link' && val === true) {
  //           const watched: Content<'watched'> = {
  //             ...item,
  //             type: 'watched',
  //             watched: Date.now(),
  //           }
  //           if (!item.pinned) sortedKeysHandler.delete(parent.sortedKeys, item);
  //           replaceObject(item, watched);
  //           if (!item.pinned) sortedKeysHandler.add(parent.sortedKeys, watched);
  //         }
  //         return { success: true, data: item };
  //       }
  //     )
  //   );
  // }

  // swapPriority(path: string[], diff: number): ResultObj<Content<'link'>> {
  //   return returnOnFail(
  //     this.get(path, 'link'),
  //     (link) => returnOnFail(
  //       this.get(path.slice(0, -1), 'folder'),
  //       (parent) => {
  //         sortedKeysHandler.move(
  //           parent.sortedKeys,
  //           link,
  //           diff,
  //         );
  //         return { success: true, data: link };
  //       }
  //     )
  //   );
  // }

  // FIX ME
  // this could also be a toggle like setWatched
  // setPinned(path: string[], val: boolean): ResultObj<Content> {
  //   return returnOnFail(
  //     this.get(path),
  //     (item) => {
  //       item.pinned = val;
  //       return { success: true, data: item };
  //     }
  //   );
  // }

  // FIX ME 
  // make query function
  //  - dfs directory from a given path
  //  - run user defined function on each item
  //  - build up some accumulator value and return it
  // This would could be used to help simplify a couple functions like:
  //  - getAllTags
  //  - pack
  //  - would also be very useful if we add a search bar in the future

  getItemPath(item: Content): string[] {
    return this.path.concat(item.title);
  }

  getParentPath(path: string[]): string[] {
    return path.slice(0, -1);
  }

  // FIX ME rename to getViewPath
  //  - make sure up arrow will respect viewPath
  //    - if in [ 'encFolder1', 'encFolder2' ], decrypt prompt for 'encFolder1' should be rendered
  //      - if user clicks up arrow, should set currentPath to [], because viewDir will just be [ 'encFolder1' ]
  getViewDir(path: string[]): string[] {
    return path.reduce((newPath, segment) => {
      const item = this.get(newPath).throw().data();
      if (item.type === 'encryptedFolder') return newPath;
      return newPath.concat(segment);
    }, [] as string[]);
  }

  get<T extends ContentTypes>(path: string[], ...types: T[]): Result<Content<T>> {
    const item = path.reduce<Content | undefined>((item, title) => {
      if (!item) return undefined;
      if (item.type === 'encryptedFolder') return item;
      if (item.type !== 'folder') return undefined;
      return item.contents[title];
    }, this.root as Content);
    
    if (!item) {
      return Result.failure(`Could not find item at: ${path.join('/')}`);
    }

    if (types.length && !types.includes(item.type as T)) {
      const expected = types.join(', ');
      return Result.failure(`Item type is ${item.type}, expected: ${expected}`);
    }
    return Result.success(item as Content<T>);
  }

  async add(path: string[], item: Content): Promise<Result<Content>> {
    return await this.get(path, 'folder').next(async (parent) => {
      if (parent.contents[item.title]) {
        return Result.failure('Title already used');
      }
      parent.contents[item.title] = item;
      sortedKeysHandler.add(parent.sortedKeys, item);
      await this.saveAndRender();
      return Result.success(item);
    });
  }

  async delete(path: string[]): Promise<Result<Content>> {
    const itemTitle = path[path.length - 1];
    const parentPath = this.getParentPath(path)
    return await this.get(parentPath, 'folder').next(async parent => {
      return await this.get(path).next(item => {
        sortedKeysHandler.delete(parent.sortedKeys, item);
        delete parent.contents[itemTitle];
        this.saveAndRender();
        return Result.success(item);
      });
    });
  }

  async rename(path: string[], newTitle: string): Promise<Result<Content>> {
    const parentPath = path.slice(0, -1);
    return (await this.delete(path)).next((item) => {
      item.title = newTitle;
      return this.add(parentPath, item);
    });
  }

  async move(path: string[], newPath: string[]): Promise<Result<Content>> {
    return (await this.delete(path)).next(item => this.add(newPath, item));
  }


  async copy(path: string[], attempt = 1): Promise<Result<Content>> {
    const parentPath = path.slice(0, -1);
    return this.get(path).next(async item => {
      const itemCopy: typeof item = JSON.parse(JSON.stringify(item));
      itemCopy.title = `${item.title}${'-COPY'.repeat(attempt)}`;
      const addResult = await this.add(parentPath, itemCopy);
      if (!addResult.success()) return this.copy(path, attempt + 1);
      return addResult;
    });
  }

  async enableEncryption(
    path: string[],
    password: string
  ): Promise<Result<Content<'folder'>>> {
    return this.get(path, 'folder').next(async (folder) => {
      const iv = getRandomBase64('iv');
      const salt = getRandomBase64('salt');
      const key = await getKey(password, salt);
      folder.encryption = { key, salt, iv };
      this.saveAndRender();
      return Result.success(folder);
    });
  }

  async disableEncryption(
    path: string[]
  ): Promise<Result<Content<'folder'>>> {
    return this.get(path, 'folder').next(async folder => {
      if (!folder.encryption) {
        return Result.failure('Item does not have encryption enabled');
      }
      delete folder.encryption;
      this.saveAndRender();
      return Result.success(folder);
    });
  }

  async encrypt(
    path: string[],
    preserve?: 'preserve'
  ): Promise<Result<Content<'encryptedFolder'>>> {
    return this.get(path, 'folder').next(async (folder) => {
      if (!folder.encryption) {
        return Result.failure(
          `Folder ${path.join('/')} does not have encryption enabled`
        );
      }
      const { encryption, contents, pinned, title, tags, sortedKeys } = folder;

      const packedContents = await asyncReduce(
        Object.keys(contents),
        async (packedContents, title) => {
          const item = contents[title];
          if (item.type === 'folder' && item.encryption) {
            const encrypted = (
              await this.encrypt(path.concat(title), preserve)
            ).throw().data();
            packedContents[title] = encrypted;
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
      return Result.success(encryptedFolder);
    });
  }

  async decrypt(
    path: string[],
    password: string
  ): Promise<Result<Content<'folder'>>> {
    return this.get(path, 'encryptedFolder').next(async (encryptedFolder) => {
      const { iv, salt, data } = encryptedFolder;
      const key = await getKey(password, salt);
      let decryptedData: Encrypted;
      try {
        decryptedData = JSON.parse(await decrypt(data, key, iv));
      } catch {
        return Result.failure('Failed to decrypt');
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
      return Result.success(decryptedFolder);
    });
  }

  async pack(path: string[] = []): Promise<Result<Content<'folder'>>> {
    return await this.get(path, 'folder').next(async folder => {
      const packedContents = await asyncReduce(
        Object.keys(folder.contents),
        async (packedContents, title) => {
          const item = folder.contents[title];
          if (item.type === 'folder' && item.encryption) {
            const encrypted = (
              await this.encrypt(path.concat(title), 'preserve')
            ).throw().data();
            packedContents[title] = encrypted;
          } else if (item.type === 'folder') {
            const packed = (
              await this.pack(path.concat(title))
            ).throw().data();
            packedContents[title] = packed;
          } else {
            packedContents[title] = item;
          }
          return packedContents;
        },
        {} as Content<'folder'>['contents']
      );
      return Result.success({ ...folder, contents: packedContents });
    });
  }

  async editTags(
    path: string[],
    action: Actions,
    ...tags: string[]
  ): Promise<Result<Content<'folder' | 'link' | 'watched'>>> {
    return this.get(path, 'folder', 'link', 'watched').next(async (item) => {
      tags.forEach(tag => tagHandler[action](item.tags, tag));
      await this.saveAndRender();
      return Result.success(item);
    });
  }

  async toggleWatched(path: string[], force?: boolean) {
    return await this.get(this.getParentPath(path), 'folder').next(async parent => {
      return await this.get(path, 'link', 'watched').next(async item => {
        if (item.type === 'link') {
          if (force === false) return Result.success(item);
          const watched: Content<'watched'> = {
            ...item,
            type: 'watched',
            watched: Date.now(),
          }
          if (!item.pinned) sortedKeysHandler.delete(parent.sortedKeys, item);
          replaceObject(item, watched);
          if (!item.pinned) sortedKeysHandler.add(parent.sortedKeys, watched);
        } else if (item.type === 'watched') {
          if (force === true) return Result.success(item);
          const { watched, ...rest } = item;
          const link: Content<'link'> = {
            ...rest,
            type: 'link',
          }
          if (!item.pinned) sortedKeysHandler.delete(parent.sortedKeys, item);
          replaceObject(item, link);
          if (!item.pinned) sortedKeysHandler.add(parent.sortedKeys, link);
        }
        return Result.success(item);
      });
    });
  }

  async swapPriority(path: string[], diff: number): Promise<Result<Content<'link'>>> {
    return await this.get(this.getParentPath(path), 'folder').next(async parent => {
      return await this.get(path, 'link').next(async link => {
        sortedKeysHandler.move(parent.sortedKeys, link, diff);
        return Result.success(link);
      });
    });
  }

  async togglePinned(path: string[], force?: boolean): Promise<Result<Content>> {
    return await this.get(path).next(item => {
      item.pinned = force || !item.pinned;
      return Result.success(item);
    });
  }
}
