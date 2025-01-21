export interface FileSystemEntryEntity {
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  file?: File;
}

export interface Tag {
  name: string;
  value: string;
}

export interface TaggedFile extends File {
  tags?: Tag[];
}

export interface FileManifestInfo {
  id: string;
  url: string;
}
