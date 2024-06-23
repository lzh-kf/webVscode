import type { FileItem, FileType } from './types/interface'
import { FileTypes } from './types/constants'
import { createFileIcon, createFolderIcon } from './createIcon'

let id = 0

const sort = (data: Array<FileItem>) => {
  data.sort((a, b) => a.sort - b.sort)
}

const createFileItem = (fileType: FileType) => {
  const isFile = fileType === FileTypes.file
  return {
    fileType,
    isLeaf: isFile,
    sort: isFile ? 1 : 0,
    icon: isFile ? createFileIcon : createFolderIcon
  }
}


const delFilerOrFolderByKey = (data: Array<FileItem>, key: string): void => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item.key === key) {
      data.splice(i, 1)
      break
    }
    if (item.children) {
      delFilerOrFolderByKey(item.children, key)
    }
  }
}

const getFolderChildren = async (handle: any, parentId = '0') => {
  let result: Array<FileItem> = []
  for await (const [key, value] of handle.entries()) {
    const { kind: fileType, name: title } = value
    const item: FileItem = {
      title,
      parentId,
      key: `${++id}`,
      parentHandle: handle,
      handle: value,
      ...createFileItem(fileType)
    }
    result.push(item)
  }
  sort(result)
  return result
}

const getFileNameSuffix = (name: string) => {
  if (name) {
    const strs = name.split('')
    let result = ''
    for (let index = strs.length - 1; 0 <= index; index--) {
      const element = strs[index]
      if (element === '.') {
        return result.split('').reverse().join('')
      } else {
        result += element
      }
    }
    return result
  } else {
    return ''
  }
}

export { delFilerOrFolderByKey, getFolderChildren, getFileNameSuffix, createFileItem }