// export interface Vault {
//   [key: string]: Vault | string
// }

export interface Vault {
  locked?: {
    data: string,
    iv: string,
    salt: string,
    fullKey?: CryptoKey
  },
  contents: {
    [key: string]: Vault | Record
  }
}

export function isFolder(item: Vault | Record): item is Vault {
  return 'contents' in item
}

// export function isLocked(item: Vault | Record) {
//   return !('contents' in item) && 'locked' in item
// }

// export type Vault = {
//   locked: {
//     data: string,
//     iv: string,
//     salt: string,
//   }
// } | {
//   contents: {
//     [key: string]: Vault | Record
//   }
// }

export interface Record {
  url: string,
  viewed: boolean,
  viewCount: number,
  totalTime?: number,
  currentTime?: number,
}

export type Props = {
  idTest: string,
  newPrefix: string[],
  hidden: boolean,
  folder: Vault,
  key: string,
}
