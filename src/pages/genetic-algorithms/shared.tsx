import {ReactNode} from 'react'

import {Breadcrumb, InternalLink, PrimaryLayout} from '../../shared/components'

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
      <InternalLink href="/">Home</InternalLink>

      <InternalLink href="/genetic-algorithms">Genetic Algorithms</InternalLink>

      <span>{props.pageName}</span>
    </Breadcrumb>
  )
}
