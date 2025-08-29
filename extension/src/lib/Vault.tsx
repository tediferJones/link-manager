import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { Content, Folder, PackedVault } from '@/types.ts';

const newVault = {
  title: '',
  contents: {},
  parent: null,
} satisfies Folder as Folder;

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
    const newFolder: Content<'folder'> = {
      type: 'folder',
      title,
      contents: {},
      parent: this.currentDir,
    };
    this.currentDir.contents[title] = newFolder;
    this.saveAndRender();
  }

  render() {
    if (!this.currentDir) throw Error('currentDir is null');
    const container = getElement('#directoryView');
    console.log('rendering', this)
    container.innerHTML = '';
    container.appendChild(
      <DirectoryView contents={this.currentDir.contents} />
    )
  }

  async save() {
    await chrome.storage.sync.set({
      [this.storageKey]: this.vault
    });
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  async getVault() {
    const chromeStorage = await chrome.storage.sync.get();
    const existingVault = chromeStorage[this.storageKey];
    const vault = existingVault || newVault;
    this.vault = vault;
    this.currentDir = vault;
    this.render();
  }

  unpack(existingVault: PackedVault, parent = null) {
    // build vault data structure, add parent to each folder
    console.log(existingVault, parent)
  }

  pack() {
    // remove parent attributes, re-encrypt decrypted folders
  }

  enterDir(key: string) {
    if (!this.currentDir) throw Error('currentDir is null');
    console.log(this.currentDir)
    if (this.currentDir.contents[key].type !== 'folder') {
      throw Error('attempting to enter item that is not a folder');
    }
    this.currentDir = this.currentDir.contents[key];
    console.log('entered', this.currentDir)
    this.render();
  }

  exitDir() {
    if (!this.currentDir) throw Error('currentDir is null');
    if (this.currentDir.parent !== null) {
      this.currentDir = this.currentDir.parent;
    }
  }
}
