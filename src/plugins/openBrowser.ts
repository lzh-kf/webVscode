export default (api: any) => {
api.onStart(() => {
    import('open').then(res => {
      res.default(`http://localhost:8000`, { app: { name: 'chrome' } })
    })
  })
}