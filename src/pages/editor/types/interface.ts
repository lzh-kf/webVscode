export type FileType = 'file' | 'directory'
export interface FileItem {
  sort: number
  key: string
  title: string
  isLeaf: boolean
  parentId: string
  fileType: FileType
  icon: () => JSX.Element
  children?: Array<FileItem>
  parentHandle?: FileSystemDirectoryHandle
  handle: FileSystemFileHandle | FileSystemDirectoryHandle
}