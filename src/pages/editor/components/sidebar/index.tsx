import React, { useEffect, useState, useRef } from 'react'
import { Tree, Button, message, Form, Input, Modal, Tooltip } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import styles from './index.css'
import type { FileItem } from '../../types/interface'
import { FileTypes } from '../../types/constants'
import { getFolderChildren, delFilerOrFolderByKey } from '../../util'
import type { FileType } from '../../interface'
import createFile from '@/assets/img/create-file.png'
import createFolder from '@/assets/img/create-folder.png'
import delFolder from '@/assets/img/del-folder.png'
interface Props {
  folders: Array<FileItem>
  changeFloders: React.Dispatch<React.SetStateAction<FileItem[]>>
  changeCurrentFile: (file: FileItem) => void
  changeParentHandle: (file: FileSystemDirectoryHandle) => void
  refreshFlag: boolean
}

type FieldType = {
  name?: string
}
interface ModelFormProps {
  open: boolean
  submit: (val: string) => void
  setOpen: (val: boolean) => void
  fileType: FileType | undefined
}

function ModelForm(props: ModelFormProps) {

  const [form] = Form.useForm()

  const inputRef = useRef<any>()

  const [label, setLabel] = useState('')

  useEffect(() => {
    const { fileType } = props
    const isFile = fileType === FileTypes.file
    setLabel(isFile ? '文件' : '文件夹')
  }, [props.fileType])

  useEffect(() => {
    const { fileType, open } = props
    if (open) {
      const isFile = fileType === FileTypes.file
      form?.setFieldsValue(isFile ? {
        name: '文件名'
      } : {
        name: '新建文件夹'
      })
      inputRef.current?.focus({
        cursor: 'end'
      })
    }

  }, [props.open])

  const handleOk = () => {
    form.submit()
    const name = form.getFieldValue('name')
    props.submit(name)
    props.setOpen(false)
    form.resetFields()
  }

  const handleCancel = () => {
    form.resetFields()
    props.setOpen(false)
  }

  return (
    <Modal title={`创建${label}确认框？`} open={props.open} onOk={handleOk} onCancel={handleCancel}>
      <Form
        form={form}
      >
        <Form.Item<FieldType>
          label={label}
          name="name"
          rules={[{ required: true, message: `请输入${label}名` }]}
        >
          <Input ref={inputRef} placeholder={`请输入${label}名`} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
const Sidebar = (props: Props) => {

  const [messageApi, contextHolder] = message.useMessage()

  const [open, setOpen] = useState(false)

  const [fileType, setFileType] = useState<FileType>()

  const [expandedKeys, setExpandedKeys] = useState<Array<React.Key>>([])

  let fileName: string

  let currentHandle = useRef<any>()

  const onSelect = (selectedKeys: Array<React.Key>, { node }: { node: FileItem }) => {
    currentHandle.current = node
    const { parentHandle } = node
    props.changeCurrentFile(node)
    parentHandle && props.changeParentHandle(parentHandle)
  }

  useEffect(() => {
    let result: Array<string> = []
    props.folders.forEach(item => {
      result.push(item.key)
      currentHandle.current = item
      if (item.fileType === FileTypes.file) {
        props.changeCurrentFile(item)
      }
    })
    setExpandedKeys(result)
  }, [props.refreshFlag])

  const handleOnExpand = (expandedKeys: Array<React.Key>) => {
    setExpandedKeys(expandedKeys)
  }

  const updateTreeData = (list: FileItem[], key: React.Key, children: FileItem[]): FileItem[] => {
    return list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children)
        }
      }
      return node
    })
  }

  const onLoadData = ({ key, children, handle }: FileItem) => {
    return new Promise<void>(async (resolve) => {
      if (children) {
        resolve()
        return
      }
      setExpandedKeys([...expandedKeys, key])
      const folders = await getFolderChildren(handle, key)
      props.changeFloders((origin: Array<FileItem>) => {
        return updateTreeData(origin, key, folders)
      })
      resolve()
    })
  }

  const handleOpenModel = (val: FileType) => {
    setOpen(true)
    setFileType(val)
  }

  const updateChildrenByKey = (data: Array<FileItem>, key: string, children: Array<FileItem>) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (item.key === key) {
        item.children = children
        break
      }
      if (item.children) {
        updateChildrenByKey(item.children, key, children)
      }
    }
  }

  const handleCreate = async (msg: string, methodName: 'getFileHandle' | 'getDirectoryHandle') => {
    try {
      const { parentHandle, value, parentId, fileType } = currentHandle.current
      const handle = fileType === 'file' ? parentHandle : value
      if (parentHandle) {
        await handle[methodName](fileName, { create: true })
        messageApi.success(`${msg}新增成功`)
      } else {
        messageApi.error('找不到上级目录，请至少选择一个目录')
        return
      }
      if (parentHandle) {
        const children = await getFolderChildren(parentHandle, parentId)
        const tempData = [...props.folders]
        updateChildrenByKey(tempData, parentId, children)
        props.changeFloders(tempData)
      } else {
        const children = await getFolderChildren(value)
        props.changeFloders([{
          ...props.folders[0],
          children
        }])
      }
    } catch (error) {
      messageApi.error(`${msg}新增失败--->${error}`)
    }
  }

  const handleCreateFile = async () => handleCreate('文件', 'getFileHandle')

  const handleCreateFolder = async () => handleCreate('文件夹', 'getDirectoryHandle')

  const handleDelFolder = async () => {
    const { fileType, key, parentHandle, title } = currentHandle.current
    if (fileType === FileTypes.file) {
      message.error('请先选择目录')
      return
    }
    if (key === '0') {
      message.error('顶级目录不允许删除')
    } else {
      try {
        await parentHandle.removeEntry(title)
        messageApi.success('文件夹删除成功')
        const tempData = [...props.folders]
        delFilerOrFolderByKey(tempData, key)
        props.changeFloders(tempData)
      } catch (error) {
        const { name } = error as DOMException
        if (name === 'InvalidModificationError') {
          messageApi.error(`请检查文件夹是否有嵌套，有嵌套默认是不可删除`)
        } else {
          messageApi.error(`文件夹删除失败--->${error}`)
        }
      }
    }
  }

  const handleSubmit = (val: string) => {
    fileName = val
    if (fileType === FileTypes.file) {
      handleCreateFile()
    } else if (fileType === FileTypes.directory) {
      handleCreateFolder()
    }
  }

  return (
    <div className={styles.container}>
      {contextHolder}
      <ModelForm fileType={fileType} open={open} setOpen={setOpen} submit={handleSubmit}></ModelForm>
      {props.folders.length > 0 &&
        <div className={styles.operation}>
          <Tooltip title="新增文件" placement="bottomLeft">
            <Button type="text" onClick={() => handleOpenModel('file')} icon={<img className={styles.icon} src={createFile}></img>}></Button>
          </Tooltip>
          <Tooltip title="新增文件夹" placement="bottomLeft">
            <Button type="text" onClick={() => handleOpenModel('directory')} icon={<img className={styles.icon} src={createFolder}></img>}></Button>
          </Tooltip>
          <Tooltip title="删除文件夹" placement="bottomLeft">
            <Button type="text" onClick={handleDelFolder} icon={<img className={styles.icon} src={delFolder}></img>}></Button>
          </Tooltip>
        </div>}
      <div className={styles.tree}>
        <Tree
          showIcon
          showLine
          onExpand={handleOnExpand}
          expandedKeys={expandedKeys}
          loadData={onLoadData}
          switcherIcon={<DownOutlined />}
          onSelect={onSelect}
          treeData={props.folders}
        />
      </div>
    </div>
  )
}

export default Sidebar
