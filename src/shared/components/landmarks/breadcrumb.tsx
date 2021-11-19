import {Children, HTMLProps, ReactNode} from 'react'

import styles from './landmarks.module.css'

function BreadcrumbItem(props: HTMLProps<HTMLLIElement>) {
  return <li {...props} className={styles.breadcrumbListItem} />
}

interface BreadcrumbProps {
  children: ReactNode
}

export function Breadcrumb(props: BreadcrumbProps) {
  const {children} = props

  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {Children.map(
          children,
          child => child && <BreadcrumbItem>{child}</BreadcrumbItem>
        )}
      </ol>
    </nav>
  )
}
