import React, { useEffect, useState, useRef } from 'react'
import { DownOutlined } from '@ant-design/icons'
import styles from './index.css'
import { Tree, Button, message, Form, Input, Modal, Tooltip } from 'antd'
import type { InputRef, TreeProps } from 'antd'
import type { Children } from '../../interface'
import { getFolderChildren, delFilerOrFolderByKey } from '../util'
import type { FileType } from '../../interface'
import createFile from '@/assets/img/create-file.png'
import createFolder from '@/assets/img/create-folder.png'
import delFolder from '@/assets/img/del-folder.png'
interface Props {
  folders: Array<Children>
  changeFloders: Function
  changeFile: Function
  changeParentHandle: Function
  refreshFlag: boolean
}
type FieldType = {
  name?: string
}
interface ModelFormProps {
  open: boolean
  submit: Function
  setOpen: Function
  fileType: FileType | undefined
}
function ModelForm(props: ModelFormProps) {
  const [form] = Form.useForm()
  const inputRef = useRef<any>()
  const [label, setLabel] = useState('')
  useEffect(() => {
    const { fileType } = props
    const isFile = fileType === 'file'
    setLabel(isFile ? '文件' : '文件夹')
  }, [props.fileType])
  useEffect(() => {
    const { fileType, open } = props
    if (open) {
      const isFile = fileType === 'file'
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
export default function Sidebar(props: Props) {
  const [messageApi, contextHolder] = message.useMessage()
  const [open, setOpen] = useState(false)
  const [fileType, setFileType] = useState<FileType>()
  const [expandedKeys, setExpandedKeys] = useState<Array<React.Key>>([])
  let fileName: string
  let currentHandle = useRef<any>()
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    const { parentHandle } = info.node as unknown as Children
    currentHandle.current = info.node
    props.changeFile(info.node)
    props.changeParentHandle(parentHandle)
  }
  useEffect(() => {
    let result: Array<string> = []
    props.folders.forEach(item => {
      result.push(item.key)
      currentHandle.current = item
      if (item.fileType === 'file') {
        props.changeFile(item)
      }
    })
    setExpandedKeys(result)
  }, [props.refreshFlag])
  const handleOnExpand = (expandedKeys: Array<React.Key>) => {
    setExpandedKeys(expandedKeys)
  }
  const updateTreeData = (list: Children[], key: React.Key, children: Children[]): Children[] => {
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

  const onLoadData = ({ key, children, value }: Children) => {
    return new Promise<void>(async (resolve) => {
      if (children) {
        resolve()
        return
      }
      setExpandedKeys([...expandedKeys, key])
      const folders = await getFolderChildren(value, key)
      props.changeFloders((origin: Array<Children>) => {
        return updateTreeData(origin, key, folders)
      })
      resolve()
    })
  }
  const handleOpenModel = (val: FileType) => {
    setOpen(true)
    setFileType(val)
  }
  const updateChildrenByKey = (data: Array<Children>, key: string, children: Array<Children>) => {
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
  const handleCreateFile = async () => {
    try {
      const handle = currentHandle.current.fileType === 'file' ? currentHandle.current.parentHandle : currentHandle.current.value
      await handle.getFileHandle(fileName, { create: true })
      messageApi.success('文件新增成功')
      if (currentHandle.current.parentHandle) {
        const children = await getFolderChildren(currentHandle.current.parentHandle, currentHandle.current.parentId)
        const tempData = [...props.folders]
        updateChildrenByKey(tempData, currentHandle.current.parentId, children)
        props.changeFloders(tempData)
      } else {
        const children = await getFolderChildren(currentHandle.current.value)
        props.changeFloders([{
          ...props.folders[0],
          children
        }])
      }
    } catch (error) {
      messageApi.error(`文件新增失败--->${error}`)
    }
  }
  const handleCreateFolder = async () => {
    try {
      const handle = currentHandle.current.fileType === 'file' ? currentHandle.current.parentHandle : currentHandle.current.value
      await handle.getDirectoryHandle(fileName, { create: true })
      messageApi.success('文件夹新增成功')
      if (currentHandle.current.parentHandle) {
        const children = await getFolderChildren(currentHandle.current.parentHandle, currentHandle.current.parentId)
        const tempData = [...props.folders]
        updateChildrenByKey(tempData, currentHandle.current.parentId, children)
        props.changeFloders(tempData)
      } else {
        const children = await getFolderChildren(currentHandle.current.value)
        props.changeFloders([{
          ...props.folders[0],
          children
        }])
      }
    } catch (error) {
      messageApi.error(`文件夹新增失败--->${error}`)
    }
  }

  const handleDelFolder = async () => {
    if (currentHandle.current.fileType === 'file') {
      message.error('请先选择目录')
      return
    }
    if (currentHandle.current.key === '0') {
      message.error('顶级目录不允许删除')
    } else {
      try {
        await currentHandle.current.parentHandle.removeEntry(currentHandle.current.title)
        messageApi.success('文件夹删除成功')
        const tempData = [...props.folders]
        delFilerOrFolderByKey(tempData, currentHandle.current.key)
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
    if (fileType === 'file') {
      handleCreateFile()
    } else if (fileType === 'directory') {
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
