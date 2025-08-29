export type ContentTypes = 'link' | 'folder' | 'encryptedFolder'

export type FolderContents = { [key: string]: AnyContent }

type ListItem = {
  title: string,
}

export interface Link extends ListItem {
  href: string,
}

export interface Folder extends ListItem {
  parent: Content<'folder'> | null,
  contents: FolderContents,
}

export interface EncryptedFolder extends ListItem {
  data: string,
  salt: string,
  iv: string,
}

export type Content<T extends ContentTypes = ContentTypes> = {
  type: T,
} & {
  link: Link,
  folder: Folder,
  encryptedFolder: EncryptedFolder,
}[T]

export type AnyContent = {
  [K in ContentTypes]: Content<K>
}[ContentTypes]

export type PackedVault = Omit<Content<'folder'>, 'parent'>
