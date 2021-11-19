import {InternalLink, PrimaryLayout} from '../../shared/components'

import styles from './styles.module.css'

export function ShowRoot() {
  return (
    <PrimaryLayout>
      <main className={styles.Container}>
        <h1>Learning Some CS Topics</h1>

        <ul>
          <li>
            <InternalLink href="/genetic-algorithms">
              Genetic Algorithms
            </InternalLink>
          </li>
        </ul>
      </main>
    </PrimaryLayout>
  )
}
