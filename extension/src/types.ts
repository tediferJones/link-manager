import { ReactElement } from 'jsx-dom';

export type ContentTypes = 'link' | 'folder' | 'encryptedFolder'

type Timestamp = number;

type FolderContents = { [title: string]: AnyContent }

type ListItem = {
  title: string,
}

interface Link extends ListItem {
  href: string,
  tags: string[],
  watched?: Timestamp,
  priority: Timestamp,
}

interface Folder extends ListItem {
  contents: FolderContents,
  tags: string[],
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

export type SizeTypes = 'sidepanel' | 'popup' | 'website'

export type Encrypted = Pick<Folder, 'contents' | 'tags'>
