import {ReactNode} from 'react'

import {ExternalLink} from '../commands'

import styles from './styles.module.scss'

interface PrimaryLayoutProps {
  children: ReactNode
}

export function PrimaryLayout(props: PrimaryLayoutProps) {
  return (
    <div className={styles.PrimaryLayout}>
      <div className={styles.PrimaryLayoutContent}>{props.children}</div>

      <footer className={styles.PrimaryLayoutFooter}>
        <ExternalLink href="https://github.com/jneander/cs.jneander.dev">
          View on Github
        </ExternalLink>
      </footer>
    </div>
  )
}
