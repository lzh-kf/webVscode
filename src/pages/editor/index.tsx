import { useState, useRef } from 'react'
import styles from './index.css'
import TopNav from './components/topNav'
import ExplanatoryPopup from './components/explanatoryPopup'
import Sidebar from './components/sidebar'
import MainView from './components/mainView'
import type { FileItem } from './types/interface'
import { delFilerOrFolderByKey } from './util'
import firstLoadUtils from '@/utils/localStorge/firstLoad'

const Editor = () => {

  const [folders, setFolders] = useState<Array<FileItem>>([])

  const [refreshFlag, setRefreshFlag] = useState<boolean>(true)

  const [currentFile, setCurrentFile] = useState<FileItem>()

  const [parentHandle, setParentHandle] = useState<FileSystemDirectoryHandle>()

  const isLoad = useRef(firstLoadUtils.has())

  const handleDel = (key: string) => {
    const tempData = [...folders]
    delFilerOrFolderByKey(folders, key)
    setFolders(tempData)
  }

  return (
    <div className={styles.container}>
      {isLoad.current ? '' : <ExplanatoryPopup></ExplanatoryPopup>}
      <div>
        <TopNav changeFloders={setFolders} changeRefreshFlag={() => setRefreshFlag(!refreshFlag)}></TopNav>
      </div>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <Sidebar folders={folders} changeFloders={setFolders} changeParentHandle={setParentHandle} changeCurrentFile={setCurrentFile} refreshFlag={refreshFlag}></Sidebar>
        </div>
        <div className={styles.Content}>
          <MainView currentFile={currentFile} parentHandle={parentHandle} refreshFlag={refreshFlag} delHandle={handleDel} ></MainView>
        </div>
      </div>
    </div>
  )
}

export default Editor
