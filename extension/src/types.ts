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
  viewed: boolean
}

export type Refs = {
  folderLoc: string[],
  updateRender: Function
}
