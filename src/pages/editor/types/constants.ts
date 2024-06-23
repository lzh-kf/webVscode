enum FileTypes {
  file = 'file',
  directory = 'directory'
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

const fileSuffixs = ['css', 'html', 'js', 'json', 'ts', 'scss', 'less', 'jsx', 'tsx', 'vue', 'custom']

export { FileTypes, Viewtypes, ViewType, imgTypes, fileTypes, fileSuffixs }