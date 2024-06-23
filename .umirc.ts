import { defineConfig } from "umi"
import zhCN from 'antd/locale/zh_CN'
export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/editor/index" }
  ],
  npmClient: 'yarn',
  plugins: ['@umijs/plugins/dist/antd'],
  outputPath: 'docs',
  base: '/webVsocde/',
  publicPath: '/webVsocde/',
  title: '在线版vscode',
  antd: {
    configProvider: {
      locale: zhCN
    }
  }
})
