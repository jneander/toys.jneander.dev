import Link from 'next/link'
import {ReactNode} from 'react'

import {Breadcrumb, PrimaryLayout} from '../../shared/components'

import styles from './styles.module.css'

interface ShowGeneticAlgorithmLayoutProps {
  children: ReactNode
  pageName: string
}

export function ShowGeneticAlgorithmLayout({
  children,
  pageName
}: ShowGeneticAlgorithmLayoutProps) {
  return (
    <PrimaryLayout>
      <div className={styles.Container}>
        <GeneticAlgorithmNavigation pageName={pageName} />

        <main className={styles.SpacedBlocks}>
          <h1>{pageName}</h1>

          {children}
        </main>
      </div>
    </PrimaryLayout>
  )
}

interface GeneticAlgorithmNavigationProps {
  pageName: string
}

export function GeneticAlgorithmNavigation(
  props: GeneticAlgorithmNavigationProps
) {
  return (
    <Breadcrumb>
      <Link href={`/`}>
        <a>Home</a>
      </Link>

      <Link href={`/genetic-algorithms`}>
        <a>Genetic Algorithms</a>
      </Link>

      <span>{props.pageName}</span>
    </Breadcrumb>
  )
}
