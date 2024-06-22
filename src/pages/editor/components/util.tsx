import { Children } from '../interface'
import file from '@/assets/img/file.png'
import folder from '@/assets/img/folder.png'
let id = 0
const sort = (data: Array<Children>) => {
  data.sort((a, b) => a.sort - b.sort)
}
const style = {
  width: '18px',
  height: '18px'
}
const createFileIcon = () => <img style={style} src={file} />
const createFolderIcon = () => <img style={style} src={folder} />
const getFolderChildren = async (handle: any, parentId = '0') => {
  let result: Array<Children> = []
  for await (const [key, value] of handle.entries()) {
    const { kind: fileType, name: title } = value
    const item: Children = {
      key: `${++id}`,
      parentId,
      title,
      fileType,
      sort: 1,
      isLeaf: true,
      parentHandle: handle,
      value,
      icon: createFileIcon
    }
    if (fileType === 'directory') {
      item.sort = 0
      item.isLeaf = false
      item.icon = createFolderIcon
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

const delFilerOrFolderByKey = (data: Array<Children>, key: string) => {
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
export { getFolderChildren, getFileNameSuffix, createFileIcon, createFolderIcon, delFilerOrFolderByKey }