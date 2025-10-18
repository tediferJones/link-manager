import modifySortedKeys from '@/lib/vault/modifySortedKeys';
import modifyTags from '@/lib/vault/modifyTags';
import getNewVault from '@/lib/vault/getNewVault';
import replaceObject from '@/lib/utils/replaceObject';
import asyncReduce from '@/lib/utils/asyncReduce';
import {
  decrypt,
  encrypt,
  getKey,
  getRandomBase64,
} from '@/lib/utils/encryption';
import { compress, decompress } from '@/lib/utils/compression';
import Result from '@/lib/vault/Result';
import {
  Actions,
  Content,
  ContentTypes,
  Encrypted,
  SavedVault,
} from '@/types.ts';

// FIX ME if we end going back to the non class style Result
// consider just breaking this class up into functions
// then we would have no classes, just functions
// since we were gunna break this file up into separate functions and just import them here anyways
// the full functional approach is just simpler
// and in this scenario userVault would just be the root folder and path

// FIX ME where possible don't use title to identify resource
// pass the item to the method, and then use Object.assign(item, changedItem)
// this will maintain the reference and allow updates

// FIX ME consider moving saving/loading logic outside of this class
// this class should take a vault and path as constructor inputs
// everything else could be handled outside the class

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
    window.dispatchEvent(event);
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  setDir(keys: string[]) {
    this.path = keys;
    this.saveAndRender();
  }

  getItemPath(item: Content): string[] {
    return this.path.concat(item.title);
  }

  getParentPath(path: string[]): string[] {
    return path.slice(0, -1);
  }

  getViewPath(path: string[] = this.path): string[] {
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

  // FIX ME
  // Ideally this should look like this:
  //
  // async add<T extends 'link' | 'folder'>(
  //   item: Content<T>,
  //   path: string[]
  // ): Promise<ResultObj<Content<T>>> {
  async add(path: string[], item: Content): Promise<Result<Content>> {
    return await this.get(path, 'folder').next(async (parent) => {
      if (parent.contents[item.title]) {
        return Result.failure('Title already used');
      }
      parent.contents[item.title] = item;
      modifySortedKeys.add(parent.sortedKeys, item);
      await this.saveAndRender();
      return Result.success(item);
    });
  }

  async delete(path: string[]): Promise<Result<Content>> {
    const itemTitle = path[path.length - 1];
    const parentPath = this.getParentPath(path)
    return await this.get(parentPath, 'folder').next(async parent => {
      return await this.get(path).next(item => {
        modifySortedKeys.delete(parent.sortedKeys, item);
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
      const {
        encryption,
        contents,
        pinned,
        title,
        tags,
        sortedKeys,
        date,
      } = folder;

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
        date,
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
        date: encryptedFolder.date,
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
      tags.forEach(tag => item.tags = modifyTags[action](item.tags, tag));
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
          if (!item.pinned) modifySortedKeys.delete(parent.sortedKeys, item);
          replaceObject(item, watched);
          if (!item.pinned) modifySortedKeys.add(parent.sortedKeys, watched);
        } else if (item.type === 'watched') {
          if (force === true) return Result.success(item);
          // FIX ME typescript will not throw an error if extra items are spread into Content<'link'>
          // try to find some way to fix that
          const { watched, ...rest } = item;
          const link: Content<'link'> = {
            ...rest,
            type: 'link',
          }
          if (!item.pinned) modifySortedKeys.delete(parent.sortedKeys, item);
          replaceObject(item, link);
          if (!item.pinned) modifySortedKeys.add(parent.sortedKeys, link);
        }
        await this.saveAndRender();
        return Result.success(item);
      });
    });
  }

  // FIX ME swapping priority of a pinned item causes rendering issues
  async swapPriority(path: string[], diff: number): Promise<Result<Content<'link'>>> {
    return await this.get(this.getParentPath(path), 'folder').next(async parent => {
      return await this.get(path, 'link').next(async link => {
        modifySortedKeys.move(parent.sortedKeys, link, diff);
        await this.saveAndRender();
        return Result.success(link);
      });
    });
  }

  async togglePinned(path: string[], force?: boolean): Promise<Result<Content>> {
    return await this.get(this.getParentPath(path), 'folder').next(async parent => {
      return await this.get(path).next(async item => {
        modifySortedKeys.delete(parent.sortedKeys, item);
        item.pinned = force || !item.pinned;
        modifySortedKeys.add(parent.sortedKeys, item);
        await this.saveAndRender();
        return Result.success(item);
      });
    })
  }

  // FIX ME 
  // This would could be used to help simplify a couple functions like:
  //  - getAllTags
  //  - pack
  //  - would also be very useful if we add a search bar in the future
  async query<T>(
    path: string[],
    func: (accumulator: T, item: Content) => T | Promise<T>,
    accumulator: T
  ) {
    return await this.get(path).next(async (item) => {
      accumulator = await func(accumulator, item);
      if (item.type === 'folder') {
        accumulator = await asyncReduce(
          Object.keys(item.contents),
          async (accumulator, title) => {
            if (item.contents[title].type === 'folder') {
              const queryResult = await this.query(
                path.concat(title),
                func,
                accumulator
              );
              accumulator = queryResult.throw().data();
            } else {
              accumulator = await func(accumulator, item.contents[title]);
            }
            return accumulator;
          },
          accumulator,
        );
      }
      return Result.success(accumulator);
    });
  }
}
