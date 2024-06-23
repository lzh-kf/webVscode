import React, { useEffect, useState, useRef } from 'react'
import { Tree, Button, message, Form, Input, Modal, Tooltip, Select } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import styles from './index.css'
import type { FileItem } from '../../types/interface'
import { FileTypes, fileSuffixs } from '../../types/constants'
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

interface SeletcProps {
  value: string
  setValue: (val: string) => void
}

function ModelForm(props: ModelFormProps) {

  const [form] = Form.useForm()

  const inputRef = useRef<any>()

  const [label, setLabel] = useState('')

  const [value, setValue] = useState('html')

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
    }
  }, [props.open])

  const handleOk = () => {
    form.submit()
    const name = form.getFieldValue('name')
    if (props.fileType === FileTypes.file && value !== 'custom') {
      props.submit(`${name}.${value}`)
    } else {
      props.submit(name)
    }
    props.setOpen(false)
    form.resetFields()
  }

  const handleCancel = () => {
    form.resetFields()
    props.setOpen(false)
  }


  const SelectNode = (props: SeletcProps) => {
    const createlabel = (val: string) => <span>{val}</span>

    const options = fileSuffixs.map(item => {
      return {
        value: item,
        label: createlabel(item)
      }
    })

    return (
      <Select options={options} defaultValue={props.value} onChange={props.setValue} />
    )
  }

  return (
    <Modal
      title={`确认创建${label}？`}
      keyboard={false}
      maskClosable={false}
      open={props.open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        form={form}
      >
        <Form.Item<FieldType>
          label={`${label}名`}
          name="name"
          rules={[{ required: true, message: `请输入${label}名` }]}
        >
          {
            props.fileType === FileTypes.file ?
              <div className={styles.formItem}>
                <div className={styles.inputContainer}>
                  <Input ref={inputRef} placeholder={`请输入${label}名`} suffix="文件后缀" />
                </div>
                <div className={styles.selectContainer}>
                  <SelectNode value={value} setValue={setValue}></SelectNode>
                </div>
              </div>
              :
              <Input ref={inputRef} placeholder={`请输入${label}名`} />

          }
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
      const { parentHandle, handle, parentId, fileType: type } = currentHandle.current
      const fileHandle = type === FileTypes.file ? parentHandle : handle
      if (parentHandle || type === FileTypes.directory) {
        await fileHandle[methodName](fileName, { create: true })
        messageApi.success(`${msg}新增成功`)
      } else {
        messageApi.error('选择单文件的模式下,默认是不可新增文件的')
        return
      }
      if (parentHandle) {
        const children = await getFolderChildren(parentHandle, parentId)
        const tempData = [...props.folders]
        updateChildrenByKey(tempData, parentId, children)
        props.changeFloders(tempData)
      } else {
        const children = await getFolderChildren(handle)
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
          messageApi.error(`请检查文件夹是否有嵌套文件/文件夹，有嵌套默认是不可删除`)
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
