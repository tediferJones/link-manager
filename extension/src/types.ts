import { ReactElement } from 'jsx-dom';

export type ContentTypes = 'link' | 'folder' | 'encryptedFolder'

type FolderContents = { [title: string]: AnyContent }

type ListItem = {
  title: string,
}

interface Link extends ListItem {
  href: string,
  tags: string[],
}

interface Folder extends ListItem {
  contents: FolderContents,
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

export type Content<T extends ContentTypes> = {
  type: T,
} & {
  link: Link,
  folder: Folder,
  encryptedFolder: EncryptedFolder,
}[T]

// FIX ME, try to merge this with Content generic, seems repetitive
export type AnyContent = {
  [K in ContentTypes]: Content<K>
}[ContentTypes]

export type ExpandedDirs = string | ExpandedDirs[]

export type Encodings = 'base64' | 'utf8'

export type RenderItem = {
  [K in ContentTypes]: (item: Content<K>) => ReactElement
}

export type HotKeyOpts = '+' | 'H' | 'U'
