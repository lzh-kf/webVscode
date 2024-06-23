import { useState, useRef, useEffect } from 'react'
import { Button, message, Tooltip } from 'antd'
import 'highlight.js/styles/github.css'
import hljs from 'highlight.js'
import styles from './index.css'
import { getFileNameSuffix } from '../../util'
import type { FileItem } from '../../types/interface'
import { FileTypes, Viewtypes, ViewType, imgTypes, fileTypes } from '../../types/constants'
import saveImg from '@/assets/img/save-file.png'
import delImg from '@/assets/img/del-file.png'
interface Props {
  refreshFlag: boolean
  currentFile: FileItem | undefined
  parentHandle: FileSystemDirectoryHandle | undefined
  delHandle: (key: string) => void
}

const MainView = (props: Props) => {

  const [messageApi, contextHolder] = message.useMessage()

  const [currentView, setCurrentView] = useState<ViewType>()

  const [base64, setBase64] = useState('')

  const [html, setHtml] = useState({ __html: '' })

  const preRef = useRef(null)

  useEffect(() => {
    const getFileContent = async () => {
      const { currentFile } = props
      if (!currentFile) {
        return
      }
      const file = await (currentFile.handle as FileSystemFileHandle).getFile()
      const reader = createFileReader()
      const { type, name } = file
      const fileNameSuffix = getFileNameSuffix(name)
      if (imgTypes.includes(type)) {
        setCurrentView(Viewtypes.img)
        reader.onload = (event) => {
          setBase64(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else if (fileTypes.includes(type) || fileTypes.includes(fileNameSuffix)) {
        setCurrentView(Viewtypes.file)
        reader.onload = (event) => {
          try {
            const html = hljs.highlightAuto(event.target?.result as string).value
            setHtml({
              __html: html
            })
          } catch (error) {
            setHtml({
              __html: event.target?.result as string
            })
          }
        }
        reader.readAsText(file)
      } else {
        setCurrentView(Viewtypes.other)
        setHtml({
          __html: `<div>暂不支持excel|pdf|xls等其他资源的查看</div>`
        })
      }
    }
    if (props.currentFile) {
      const { kind } = props.currentFile.handle
      if (kind === FileTypes.file) {
        getFileContent()
      }
    }
  }, [props.currentFile])

  useEffect(() => {
    handleResetData()
  }, [props.refreshFlag])

  const handleResetData = () => {
    setCurrentView(Viewtypes.empty)
    setBase64('')
    setHtml({ __html: '' })
  }

  const handleSaveFile = async () => {
    const { currentFile } = props
    const { innerText } = preRef.current as unknown as HTMLElement
    if (!currentFile) {
      return
    }
    const { handle } = currentFile
    try {
      const writableStream = await (handle as FileSystemFileHandle).createWritable()
      await writableStream.write(innerText)
      await writableStream.close()
      messageApi.success('文件保存成功')
    } catch (error) {
      messageApi.error('文件保存失败')
    }
  }

  const handleDelFile = async () => {
    if (!props.currentFile) {
      return
    }
    const { parentHandle, currentFile: { handle, key } } = props
    const { name } = handle
    try {
      if (parentHandle) {
        await parentHandle.removeEntry(name)
      } else {
        if ((handle as any).remove) {
          (handle as any).remove()
        } else {
          messageApi.success('该浏览器不支持删除单文件,请切换浏览器在测试')
          return
        }
      }
      messageApi.success('文件删除成功')
      props.delHandle(key)
      handleResetData()
    } catch (error) {
      messageApi.error(`文件删除失败--->${error}`)
    }
  }

  const createFileReader = () => new FileReader()

  const renderOperatingButton = () => {
    const { currentFile } = props
    if (!currentFile) {
      return
    }
    const { kind } = currentFile.handle || {}
    if (kind === FileTypes.file) {
      return (
        <>
          {currentView === Viewtypes.file ? <Tooltip title="保存文件" placement="bottomLeft">
            <Button type="text" onClick={handleSaveFile} icon={<img className={styles.icon} src={saveImg}></img>}></Button>
          </Tooltip> : null}
          <Tooltip title="删除文件" placement="bottomLeft">
            <Button type="text" onClick={handleDelFile} icon={<img className={styles.icon} src={delImg}></img>}></Button>
          </Tooltip>
        </>
      )
    }
  }

  const render = () => {
    if (currentView === Viewtypes.img) {
      return (<div className={styles.container}>
        <div className={styles.save}>
          {renderOperatingButton()}
        </div>
        <div className={styles.centerContainer}>
          <img src={base64} className={styles.img} />
        </div>
      </div>)
    } else if (currentView === Viewtypes.file) {
      return (<div className={styles.container}>
        <div className={styles.save}>
          {renderOperatingButton()}
        </div>
        <div className={styles.viewContainer}>
          <pre ref={preRef} dangerouslySetInnerHTML={html} contentEditable={true}>
          </pre>
        </div>
      </div >)
    } else if (currentView === Viewtypes.other) {
      return (<div className={styles.container}>
        <div className={styles.save}>
          {renderOperatingButton()}
        </div>
        <div className={styles.centerContainer}>
          <div dangerouslySetInnerHTML={html}></div>
        </div>
      </div >)
    }
  }

  return (
    <>
      {contextHolder}
      {render()}
    </>
  )
}

export default MainView
