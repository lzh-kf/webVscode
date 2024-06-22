import { useState, useRef, useEffect } from 'react'
import { Button, message, Tooltip } from 'antd'
import hljs from 'highlight.js'
import { getFileNameSuffix } from '../util'
import 'highlight.js/styles/github.css'
import styles from './index.css'
import type { FileType } from '../../interface'
import saveImg from '@/assets/img/save-file.png'
import delImg from '@/assets/img/del-file.png'
interface Props {
  refreshFlag: boolean
  value: {
    key: string
    value: {
      kind: FileType
      name: string
      createWritable: Function
      getFile: Function
      getFileHandle: Function
      getDirectoryHandle: Function
      remove: Function
      removeEntry: Function
    }
  },
  parentHandle: any
  delHandle: Function
}
enum Viewtypes {
  img = 'img',
  file = 'file',
  other = 'other',
  empty = 'empty'
}
type ViewType = 'img' | 'file' | 'other' | 'empty'
const imgTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const fileTypes = ['text/css', 'text/html', 'text/javascript', 'application/json', 'text/plain', 'vue', 'tsx', 'jsx', 'ts', 'scss', 'less', , 'env', 'lock', 'gitignore', 'java', 'php', 'md', 'class', 'log', 'yml', 'npmignore', 'cmd']
export default function MainView(props: Props) {
  const [messageApi, contextHolder] = message.useMessage()
  const [currentView, setCurrentView] = useState<ViewType>()
  const [base64, setBase64] = useState('')
  const [html, setHtml] = useState({ __html: '' })
  const preRef = useRef(null)
  const handleResetData = () => {
    setCurrentView(Viewtypes.empty)
    setBase64('')
    setHtml({ __html: '' })
  }
  useEffect(() => {
    handleResetData()
  }, [props.refreshFlag])
  const handleSaveFile = async () => {
    const { value } = props
    if (value) {
      const { innerText } = preRef.current as unknown as HTMLElement
      try {
        const writableStream = await value.value.createWritable()
        await writableStream.write(innerText)
        await writableStream.close()
        messageApi.success('文件保存成功')
      } catch (error) {
        messageApi.error('文件保存失败')
      }
    } else {
      messageApi.info('请先选择文件')
    }
  }
  const handleDelFile = async () => {
    const { parentHandle, value } = props
    if (value) {
      try {
        if (parentHandle) {
          await parentHandle.removeEntry(value.value.name)
        } else {
          value.value.remove()
        }
        messageApi.success('文件删除成功')
        props.delHandle(value.key)
        handleResetData()
      } catch (error) {
        messageApi.error(`文件删除失败--->${error}`)
      }
    }
  }
  const createFileReader = () => new FileReader()
  useEffect(() => {
    const getFileContent = async () => {
      const file = await props.value.value.getFile()
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
    if (props.value) {
      const { kind } = props.value.value
      if (kind === 'file') {
        getFileContent()
      }
    }
  }, [props.value])
  const renderOperatingButton = () => {
    const { kind } = props.value.value || {}
    if (kind === 'file') {
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
