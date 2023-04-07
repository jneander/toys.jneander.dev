import {InternalLink, PrimaryLayout} from '../../shared/components'
import {renderPage} from '../render-page'

import styles from './styles.module.css'

renderPage(() => (
  <PrimaryLayout>
    <main className={styles.Container}>
      <h1>Learning Some CS Topics</h1>

      <ul>
        <li>
          <InternalLink href="/genetic-algorithms">Genetic Algorithms</InternalLink>
        </li>

        <li>
          <InternalLink href="/simulations">Simulations</InternalLink>
        </li>
      </ul>
    </main>
  </PrimaryLayout>
))
