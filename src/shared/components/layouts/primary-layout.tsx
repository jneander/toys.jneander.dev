import {ReactNode} from 'react'

import styles from './styles.module.scss'

interface PrimaryLayoutProps {
  children: ReactNode
}

export function PrimaryLayout(props: PrimaryLayoutProps) {
  return <div className={styles.PrimaryLayout}>{props.children}</div>
}
