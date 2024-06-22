import styles from './index.css'
import { Dropdown, Button } from "antd"
import type { MenuProps } from 'antd'
import type { Children } from '../../interface'
import { getFolderChildren, createFileIcon, createFolderIcon } from '../util'
type Mode = 'readwrite' | 'read'
const defaultOption: { mode: Mode } = {
  mode: 'readwrite'
}
interface Props {
  changeFloders: Function
  changeRefreshFlag: Function
}
export default function TopNav(props: Props) {
  const handleOpenFile = () => {
    showOpenFilePicker().then(async (res) => {
      const [fileHandle] = res
      const { name: title } = fileHandle
      const file: Children = {
        key: '0',
        parentId: '-1',
        title,
        fileType: 'file',
        sort: 1,
        value: fileHandle,
        isLeaf: true,
        icon: createFileIcon
      }
      props.changeFloders([file])
      props.changeRefreshFlag()
    })
  }
  const handleOpenFolder = () => {
    showDirectoryPicker(defaultOption).then(async (res) => {
      const { name: title } = res
      const folder: Children = {
        key: '0',
        parentId: '-1',
        title,
        fileType: 'directory',
        sort: 0,
        children: [],
        value: res,
        isLeaf: false,
        icon: createFolderIcon
      }
      const children = await getFolderChildren(res)
      folder.children = children
      props.changeFloders([folder])
      props.changeRefreshFlag()
    })
  }
  const items: MenuProps['items'] = [
    {
      key: 1,
      label: (
        <Button type="text" onClick={handleOpenFile} icon={createFileIcon()}>
          打开文件
        </Button>
      ),
    },
    {
      key: 2,
      label: (
        <Button type="text" onClick={handleOpenFolder} icon={createFolderIcon()}>
          打开文件夹
        </Button>
      ),
    },
  ]
  return (
    <div className={styles.container}>
      <Dropdown menu={{ items }} placement="bottom">
        <Button type="text">文件</Button>
      </Dropdown>
    </div>
  )
}

