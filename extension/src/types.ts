import { ReactElement } from 'jsx-dom';

// FIX ME double check that exported types actually get used somewhere
// if not used then delete them

export type ContentTypes = 'link' | 'folder' | 'encryptedFolder' | 'watched'

type ListItem = {
  title: string,
  pinned: boolean,
  date: number,
}

interface Link extends ListItem {
  href: string,
  tags: string[],
}

interface Watched extends Link {
  watched: number,
}

// FIX ME this type should mirror ContentTypes, something like:
// Exclude<ContentTypes, 'encryptedFolder'>
// export type SortedKeysTypes = 'pinned' | 'folders' | 'links' | 'watched'
export type SortedKeysTypes = Exclude<ContentTypes, 'encryptedFolder'> | 'pinned'
export type SortedKeys = { [K in SortedKeysTypes]: string[] }

interface Folder extends ListItem {
  contents: { [title: string]: Content },
  tags: string[],
  sortedKeys: SortedKeys,
  encryption?: {
    key: CryptoKey,
    salt: string,
    iv: string,
  }
}

interface EncryptedFolder extends ListItem {
  data: string,
  salt: string,
  iv: string,
}

// FIX ME if new content type does not causes errors delete this
// export type Content<T extends ContentTypes> = {
//   type: T,
// } & {
//   link: Link,
//   folder: Folder,
//   encryptedFolder: EncryptedFolder,
// }[T]
// 
// // FIX ME, try to merge this with Content generic, seems repetitive
// export type AnyContent = {
//   [K in ContentTypes]: Content<K>
// }[ContentTypes]

export type Content<T extends ContentTypes = ContentTypes> = {
  [K in ContentTypes]: { type: K } & {
    link: Link,
    folder: Folder,
    encryptedFolder: EncryptedFolder,
    watched: Watched,
  }[K]
}[T]

export type ExpandedDirs = string | ExpandedDirs[]

export type Encodings = 'base64' | 'utf8'

export type RenderItem = {
  [K in ContentTypes]: (item: Content<K>) => ReactElement
}

export type HotKeyOpts = '+' | 'H' | 'U'

export type SizeTypes = 'sidepanel' | 'popup' | 'website'

export type Encrypted = Pick<Folder, 'contents' | 'tags' | 'sortedKeys'>

export type Actions = 'add' | 'delete'

// export type SortedKeysHandler = {
//   [T in SortedKeysTypes]: {
//     [A in SortedKeysActions]: (
//       dir: Content<'folder'>, item: { title: string }
//     ) => void;
//   }
// }

// FIX ME rename to Result
// Consider moving this type into Result class, that's the only place it gets used
// but having all types centralized to this file isn't a bad idea either
export type ResultObj<T> =
  | { success: true, data: T }
  | { success: false, error: string }

export type SavedVault = { vault: Content<'folder'>, path: string[] }

export type TagHandler = {
  [K in Actions]: (tags: string[], inputTag: string) => string[]
}
