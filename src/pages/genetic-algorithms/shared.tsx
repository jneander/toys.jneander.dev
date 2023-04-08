import {ReactNode} from 'react'

import {PrimaryLayout} from '../../shared/components'

interface ShowGeneticAlgorithmLayoutProps {
  children: ReactNode
  pageName: string
}

export function ShowGeneticAlgorithmLayout({children, pageName}: ShowGeneticAlgorithmLayoutProps) {
  return (
    <PrimaryLayout>
      <main className="flow">
        <h1>{pageName}</h1>

        {children}
      </main>
    </PrimaryLayout>
  )
}
