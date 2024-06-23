import file from '@/assets/img/file.png'
import folder from '@/assets/img/folder.png'

const style = {
  width: '18px',
  height: '18px'
}

const createFileIcon = () => <img style={style} src={file} />

const createFolderIcon = () => <img style={style} src={folder} />

export { createFileIcon, createFolderIcon }