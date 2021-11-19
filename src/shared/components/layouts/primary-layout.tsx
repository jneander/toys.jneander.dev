import {ReactNode} from 'react'

import styles from './styles.module.css'

interface PrimaryLayoutProps {
  children: ReactNode
}

export function PrimaryLayout(props: PrimaryLayoutProps) {
  return (
    <div className={styles.PrimaryLayout}>
      <div className={styles.PrimaryLayoutContent}>{props.children}</div>

      <footer className={styles.PrimaryLayoutFooter}>
        <a href="https://github.com/jneander/cs.jneander.dev">View on Github</a>
      </footer>
    </div>
  )
}
