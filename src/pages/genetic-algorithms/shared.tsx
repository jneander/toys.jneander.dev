import {ReactNode} from 'react'

import {Breadcrumb, InternalLink, PrimaryLayout} from '../../shared/components'

interface ShowGeneticAlgorithmLayoutProps {
  children: ReactNode
  pageName: string
}

export function ShowGeneticAlgorithmLayout({children, pageName}: ShowGeneticAlgorithmLayoutProps) {
  return (
    <PrimaryLayout>
      <div className="flow">
        <GeneticAlgorithmNavigation pageName={pageName} />

        <main className="flow">
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

export function GeneticAlgorithmNavigation(props: GeneticAlgorithmNavigationProps) {
  return (
    <Breadcrumb>
      <InternalLink href="/">Home</InternalLink>

      <InternalLink href="/genetic-algorithms">Genetic Algorithms</InternalLink>

      <span>{props.pageName}</span>
    </Breadcrumb>
  )
}
