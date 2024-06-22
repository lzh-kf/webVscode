import { useState } from 'react'
import styles from './index.css'
import TopNav from './components/topNav'
import Sidebar from './components/sidebar'
import MainView from './components/mainView'
import type { Children } from './interface'
import { delFilerOrFolderByKey } from './components/util'
export default function Editor() {
  const [folders, setFolders] = useState<Array<Children>>([])
  const [refreshFlag, setRefreshFlag] = useState<boolean>(true)
  const [file, setFile] = useState<any>()
  const [parentHandle, setParentHandle] = useState<any>()
  const handleDel = (key: string) => {
    const tempData = [...folders]
    delFilerOrFolderByKey(folders, key)
    setFolders(tempData)
  }
  return (
    <div className={styles.container}>
      <div>
        <TopNav changeFloders={setFolders} changeRefreshFlag={() => setRefreshFlag(!refreshFlag)}></TopNav>
      </div>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <Sidebar folders={folders} changeFloders={setFolders} changeParentHandle={setParentHandle} changeFile={setFile} refreshFlag={refreshFlag}></Sidebar>
        </div>
        <div className={styles.Content}>
          <MainView value={file} delHandle={handleDel} parentHandle={parentHandle} refreshFlag={refreshFlag}></MainView>
        </div>
      </div>
    </div>
  )
}
