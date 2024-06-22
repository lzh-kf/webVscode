export type FileType = 'file' | 'directory'
type Sort = 0 | 1
export interface Children {
  parentId: string
  key: string
  title: string
  fileType: FileType
  sort: Sort
  value: any
  isLeaf: boolean
  icon: () => JSX.Element
  parentHandle?: any
  children?: Array<Children>
}