import {
  Breadcrumb,
  ClientOnly,
  InternalLink,
  PrimaryLayout
} from '../../../../shared/components'
import {CarykhEvolutionSimulator} from '../../../../simulations'

import styles from './styles.module.css'

const PAGE_NAME = "Carykh's Evolution Simulator"

export function ShowCarykhEvolutionSimulator() {
  return (
    <PrimaryLayout>
      <div className={styles.Container}>
        <Breadcrumb>
          <InternalLink href="/">Home</InternalLink>

          <span>Simulations</span>

          <span>carykh</span>

          <span>{PAGE_NAME}</span>
        </Breadcrumb>

        <main className={styles.SpacedBlocks}>
          <h1>{PAGE_NAME}</h1>

          <ClientOnly>
            <CarykhEvolutionSimulator />
          </ClientOnly>
        </main>
      </div>
    </PrimaryLayout>
  )
}
