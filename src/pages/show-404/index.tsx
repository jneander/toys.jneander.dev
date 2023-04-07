import {PrimaryLayout} from '../../shared/components'
import {renderPage} from '../render-page'

import styles from './styles.module.css'

renderPage(() => (
  <PrimaryLayout>
    <main className={styles.Container}>
      <h1>Page Not Found</h1>
    </main>
  </PrimaryLayout>
))
