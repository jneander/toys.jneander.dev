import Link from 'next/link'

import {PrimaryLayout} from '../../shared/components'

import styles from './styles.module.css'

export function ShowRoot() {
  return (
    <PrimaryLayout>
      <main className={styles.Container}>
        <h1>Learning Some CS Topics</h1>

        <ul>
          <li>
            <Link href="/genetic-algorithms">
              <a>Genetic Algorithms</a>
            </Link>
          </li>
        </ul>
      </main>
    </PrimaryLayout>
  )
}
