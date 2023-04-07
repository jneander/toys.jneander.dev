import {Breadcrumb, InternalLink, PrimaryLayout} from '../../../shared/components'
import {renderPage} from '../../render-page'

import styles from './styles.module.css'

renderPage(() => (
  <PrimaryLayout>
    <div className={styles.Container}>
      <Breadcrumb>
        <InternalLink href="/">Home</InternalLink>

        <span>Genetic Algorithms</span>
      </Breadcrumb>

      <main>
        <h1>Genetic Algorithms</h1>

        <ul>
          <li>
            <InternalLink href="/genetic-algorithms/text-matching">Text Matching</InternalLink>
          </li>

          <li>
            <InternalLink href="/genetic-algorithms/one-max">One Max</InternalLink>
          </li>

          <li>
            <InternalLink href="/genetic-algorithms/sorting-numbers">Sorting Numbers</InternalLink>
          </li>

          <li>
            <InternalLink href="/genetic-algorithms/queens">Queens</InternalLink>
          </li>

          <li>
            <InternalLink href="/genetic-algorithms/card-splitting">Card Splitting</InternalLink>
          </li>

          <li>
            <InternalLink href="/genetic-algorithms/knight-covering">Knight Covering</InternalLink>
          </li>
        </ul>
      </main>
    </div>
  </PrimaryLayout>
))
