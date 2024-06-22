import { Outlet } from 'umi'
import styles from './index.less'
import 'normalize.css'
export default function Layout(): JSX.Element {
  return (
    <div className={styles.index}>
      <Outlet />
    </div>
  )
}
