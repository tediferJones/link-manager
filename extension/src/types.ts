// export interface Vault {
//   [key: string]: Vault | string
// }

export interface Vault {
  locked?: {
    data: string,
    iv: string,
    salt: string,
  },
  contents: {
    [key: string]: Vault | Record
  }
}

export interface Record {
  url: string,
  viewed: boolean
}
