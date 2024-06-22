type Mode = 'readwrite' | 'read'
interface Option {
  mode: Mode
}
declare function showDirectoryPicker(option?: Option): Promise<FileSystemDirectoryHandle>
declare function showOpenFilePicker(): Promise<any>