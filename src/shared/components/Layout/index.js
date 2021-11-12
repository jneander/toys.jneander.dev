import Sidebar from '../Sidebar'

import styles from './styles.module.css'

export default function Layout(props) {
  return (
    <div className={styles.Layout}>
      <Sidebar page={props.page} />

      <main className={styles.Main}>{props.children}</main>
    </div>
  )
}
