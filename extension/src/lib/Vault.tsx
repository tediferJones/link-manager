import DirectoryView from '@/components/directoryView';
import { EncryptedFolder, Folder, Link } from '@/types.ts'

const newVault = {
  title: '',
  contents: []
} satisfies Folder as Folder;

export default class Vault {
  vault: Folder;
  currentDir: Folder | EncryptedFolder;
  storageKey = 'link-manager';

  constructor()  {
    this.vault = newVault;
    this.currentDir = newVault;
  }

  addLink(title: string, href: string) {
    const newLink: Link = { title, href };
    this.currentDir.contents.push(newLink);
    this.saveAndRender();
  }

  addFolder(title: string) {
    if (!title) throw Error('folder must have a title');
    const newFolder: Folder = { title, contents: [] };
    this.currentDir.contents.push(newFolder);
    this.saveAndRender();
  }

  render() {
    const container = document.querySelector('#directoryView');
    if (!container) throw Error('could not find directoryView');
    console.log('rendering', this)
    container.innerHTML = '';
    container.appendChild(
      <DirectoryView contents={this.currentDir.contents} />
    )
  }

  async save() {
    // Cannot access chrome.storage from here,
    // maybe try background script?
    // await chrome.storage.sync.set({
    //   [this.storageKey]: this.vault
    // });
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }
}
