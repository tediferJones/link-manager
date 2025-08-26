type ContentTypes = 'link' | 'folder' | 'encryptedFolder'

type Link = {
  href: string,
}

export type Folder = {
  contents: (Link | Folder | EncryptedFolder)[]
}

interface EncryptedFolder extends Folder {
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
