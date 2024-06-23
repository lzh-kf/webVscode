import { Outlet } from 'umi'
import './index.less'
import 'normalize.css'
export default function Layout(): JSX.Element {
  return (
    <div>
      <Outlet />
    </div>
  )
}
