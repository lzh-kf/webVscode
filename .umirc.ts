import { defineConfig } from "umi"
export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/editor/index" }
  ],
  npmClient: 'yarn',
  plugins: ['@umijs/plugins/dist/antd'],
  outputPath: 'docs'
})
