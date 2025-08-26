import { Folder } from '@/types.ts'

const newVault = {
  contents: []
} satisfies Folder;

export default class Vault {
  vault: Folder;

  constructor()  {
    this.vault = newVault;
    // chrome.storage.local.get('link-manager').then(data => {
    //   this.vault = data;
    // })
  }
}
