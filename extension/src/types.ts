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
  queueStart: number,
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

// export type MsgActions = 'sendRecord' | 'getNextRecord'
// 
// export type ScriptMsg<T extends MsgActions = MsgActions> = {
//   action: T
// } & MsgContents[T]
// 
// type MsgContents = {
//   sendRecord: {
//     record: Record
//   }
//   getNextRecord: {}
// }
