import styles from './index.css'
import { Dropdown, Button, message } from "antd"
import type { MenuProps } from 'antd'
import type { FileItem } from '../../types/interface'
import { FileTypes } from '../../types/constants'
import { getFolderChildren, createFileItem } from '../../util'
import { createFileIcon, createFolderIcon } from '../../createIcon'
import selectImg from '@/assets/img/select.png'
interface Props {
  changeFloders: (folders: Array<FileItem>) => void
  changeRefreshFlag: () => void
}

const TopNav = (props: Props) => {

  const [messageApi, contextHolder] = message.useMessage()

  const handleOpenFile = () => {
    showOpenFilePicker().then(async (res) => {
      const [fileHandle] = res
      const { name: title } = fileHandle
      const item: FileItem = {
        title,
        key: '0',
        parentId: '-1',
        handle: fileHandle,
        ...createFileItem(FileTypes.file)
      }
      props.changeFloders([item])
      props.changeRefreshFlag()
    }).catch(() => {
      messageApi.info('用户取消了')
    })
  }

  const handleOpenFolder = () => {
    showDirectoryPicker({ mode: 'readwrite' }).then(async (res) => {
      const { name: title } = res
      const folder: FileItem = {
        title,
        key: '0',
        parentId: '-1',
        handle: res,
        ...createFileItem(FileTypes.directory)
      }
      try {
        const children = await getFolderChildren(res)
        folder.children = children
        props.changeFloders([folder])
        props.changeRefreshFlag()
      } catch (error) {
        messageApi.error(`读取文件夹错误---》${error}`)
      }
    }).catch(() => {
      messageApi.info('用户取消了')
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
      {contextHolder}
      <Dropdown menu={{ items }} placement="bottom">
        <Button type="text" icon={<img src={selectImg} className={styles.icon}></img>}>选择文件123</Button>
      </Dropdown>
      <div className={styles.title}>主内容区域</div>
    </div>
  )
}

export default TopNav

