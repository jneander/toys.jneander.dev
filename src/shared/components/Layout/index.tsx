import {ReactNode} from 'react'

import Sidebar from '../Sidebar'

import styles from './styles.module.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout(props: LayoutProps) {
  return (
    <div className={styles.Layout}>
      <Sidebar />

      <main className={styles.Main}>{props.children}</main>
    </div>
  )
}
