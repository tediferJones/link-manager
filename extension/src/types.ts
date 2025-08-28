type ContentTypes = 'link' | 'folder' | 'encryptedFolder'

export type FolderContents = (Link | Folder | EncryptedFolder)[]

export type Link = {
  href: string,
  title: string,
}

export type Folder = {
  title: string,
  contents: FolderContents,
}

export interface EncryptedFolder extends Folder {
  encryption: {}
}

type GetParams<T extends ContentTypes> = {
  link: Link,
  folder: Folder,
  encryptedFolder: EncryptedFolder,
}[T]

export type Content<T extends ContentTypes> = {
  type: T,
} & GetParams<T>
