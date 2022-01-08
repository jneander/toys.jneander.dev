import {
  Breadcrumb,
  InternalLink,
  PrimaryLayout
} from '../../../shared/components'

import styles from './styles.module.css'

export function ShowSimulations() {
  return (
    <PrimaryLayout>
      <div className={styles.Container}>
        <Breadcrumb>
          <InternalLink href="/">Home</InternalLink>

          <span>Simulations</span>
        </Breadcrumb>

        <main>
          <h1>Simulations</h1>

          <ul>
            <li>
              <InternalLink href="/simulations/carykh">carykh</InternalLink>
            </li>
          </ul>
        </main>
      </div>
    </PrimaryLayout>
  )
}