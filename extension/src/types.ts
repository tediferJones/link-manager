export interface Vault {
  locked?: {
    data: string,
    iv: string,
    salt: string,
    fullKey?: CryptoKey
  },
  contents: {
    [key: string]: Vault | Record
  },
  parent: Vault | undefined,
  title: string,
  // sortedKeys: string[],
  sortedKeys: {
    folders: string[],
    links: string[],
  },
}

export interface Record {
  url: string,
  viewed: boolean,
  viewCount: number,
  totalTime?: number,
  currentTime?: number,
  queuePos: number,
}

// Can probably delete this
export type Props = {
  idTest: string,
  newPrefix: string[],
  hidden: boolean,
  folder: Vault,
  key: string,
}
