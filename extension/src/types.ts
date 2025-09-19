import { ReactElement } from 'jsx-dom';

// FIX ME double check that exported types actually get used somewhere
// if not used then delete them

export type ContentTypes = 'link' | 'folder' | 'encryptedFolder' | 'watched'

type ListItem = {
  title: string,
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
export type SortedKeysTypes = 'pinned' | 'folders' | 'links' | 'watched'

interface Folder extends ListItem {
  contents: { [title: string]: Content },
  tags: string[],
  sortedKeys: { [K in SortedKeysTypes]: string[] }
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

export type SortedKeysActions = 'add' | 'remove'

export type SortedKeysHandler = {
  [T in SortedKeysTypes]: {
    [A in SortedKeysActions]: (
      dir: Content<'folder'>, item: { title: string }
    ) => void;
  }
}

export type MoveActions = 'start' | 'end' | 'cancel'

export type ResultObj = { success: true } | { success: false, error: string }
