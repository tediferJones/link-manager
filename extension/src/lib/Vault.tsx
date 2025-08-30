import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { Content, Optional } from '@/types.ts';

const newVault = {
  type: 'folder',
  title: '',
  contents: {},
  parent: null,
} satisfies Content<'folder'> as Content<'folder'>;

export default class Vault {
  // this will make it easier to copy this over to the webpage
  // mode: 'extension' | 'webpage';
  vault: Content<'folder'> | null;
  // change this to an array of strings
  // should make it easier to build expandable directory view later
  // might need both currentDir folder and array of keys
  currentDir: Content<'folder'> | null;
  storageKey = 'link-manager';

  constructor()  {
    // const existingVault = chrome.storage.sync.get(this.storageKey);
    // console.log(existingVault)
    this.vault = null;
    this.currentDir = null;
    this.getVault();
  }

  addLink(title: string, href: string) {
    if (!this.currentDir) throw Error('currentDir is null');
    const newLink: Content<'link'> = {
      type: 'link',
      title,
      href,
    };
    this.currentDir.contents[title] = newLink;
    this.saveAndRender();
  }

  addFolder(title: string) {
    if (!this.currentDir) throw Error('currentDir is null');
    const parent = this.currentDir;
    const newFolder: Content<'folder'> = {
      type: 'folder',
      title,
      contents: {},
      parent,
    };
    console.log({ newFolder, parent })
    this.currentDir.contents[title] = newFolder;
    this.saveAndRender();
  }

  render() {
    if (!this.currentDir) throw Error('currentDir is null');
    const container = getElement('#directoryView');
    container.innerHTML = '';
    container.appendChild(
      <DirectoryView contents={this.currentDir.contents} />
    );
  }

  async save() {
    if (!this.vault) return;
    console.log('packed', this.pack(this.vault))
    await chrome.storage.sync.set({
      [this.storageKey]: this.pack(this.vault),
    });
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  async getVault() {
    const chromeStorage = await chrome.storage.sync.get();
    const existingVault: Content<'folder'> | undefined = (
      chromeStorage[this.storageKey]
    );
    console.log('packed', existingVault)
    console.log('unpacked', existingVault && this.unpack(existingVault))
    const vault = existingVault ? this.unpack(existingVault) : newVault;
    this.vault = vault;
    this.currentDir = vault;
    this.render();
  }

  unpack(
    folder: Content<'folder'>,
    parent: Content<'folder'>['parent'] = null
  ): Content<'folder'> {
    // build vault data structure, add parent to each folder
    //
    // for some reason spreading folder into a new object (like in this.pack)
    // will break parent relationships
    console.log({ folder, parent })

    folder.parent = parent;
    folder.contents = Object.keys(folder.contents).reduce((unpacked, key) => {
      if (folder.contents[key].type === 'folder') {
        unpacked[key] = this.unpack(folder.contents[key], folder);
      } else {
        unpacked[key] = folder.contents[key];
      }
      return unpacked;
    }, {} as Content<'folder'>['contents']);
    return folder;
  }

  pack(folder: Optional<Content<'folder'>, 'parent'>) {
    // remove parent attributes, re-encrypt decrypted folders
    const { parent, contents, ...rest } = folder;
    return {
      ...rest,
      contents: Object.keys(contents).reduce((packed, key) => {
        const item = contents[key];
        if (item.type !== 'folder') {
          packed[key] = item;
        } else if (item.encryption) {
          // encrypt decrypted folder
          throw Error('beep beep not quite there yet');
        } else {
          packed[key] = this.pack(item);
        }
        return packed;
        // FIX ME, we need a recursive type where each nested folder's parent prop is optional
      }, {} as any)
    }
  }

  enterDir(key: string) {
    if (!this.currentDir) throw Error('currentDir is null');
    if (this.currentDir.contents[key].type !== 'folder') {
      throw Error('attempting to enter item that is not a folder');
    }
    if (!('parent' in this.currentDir.contents[key])) {
      console.log(this.currentDir.contents[key])
      throw Error('lost parent')
    }
    this.currentDir = this.currentDir.contents[key];
    console.log('entered', this.currentDir)
    this.render();
  }

  exitDir() {
    console.log('exiting', this.currentDir)
    if (!this.currentDir) throw Error('currentDir is null');
    if (this.currentDir.parent !== null) {
      console.log('going up')
      console.log(JSON.parse(JSON.stringify(this.currentDir.parent)))
      this.currentDir = this.currentDir.parent;
      this.render();
    }
  }
}
