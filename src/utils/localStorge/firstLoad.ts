const key = 'isFirstLoad'
const firstLoadUtils = {
  get() {
    return localStorage.getItem(key)
  },
  set() {
    localStorage.setItem(key, 'true')
  },
  has() {
    return !!localStorage.getItem(key)
  }
}
export default firstLoadUtils