export type ContentTypes = 'link' | 'folder' | 'encryptedFolder'

export type FolderContents = { [title: string]: AnyContent }

type ListItem = {
  title: string,
}

interface Link extends ListItem {
  href: string,
}

interface Folder extends ListItem {
  contents: FolderContents,
  encryption?: {
    newKey: string,
    newSalt: string,
    newIv: string,
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

export type AnyContent = {
  [K in ContentTypes]: Content<K>
}[ContentTypes]

export type ExpandedDirs = string | ExpandedDirs[]

export type Encodings = 'base64' | 'utf8'
