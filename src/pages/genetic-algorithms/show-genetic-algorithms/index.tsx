import Link from 'next/link'

import {Breadcrumb, PrimaryLayout} from '../../../shared/components'

import styles from './styles.module.css'

export function ShowGeneticAlgorithms() {
  return (
    <PrimaryLayout>
      <div className={styles.Container}>
        <Breadcrumb>
          <Link href={`/`}>
            <a>Home</a>
          </Link>

          <span>Genetic Algorithms</span>
        </Breadcrumb>

        <main>
          <h1>Genetic Algorithms</h1>

          <ul>
            <li>
              <Link href="/genetic-algorithms/text-matching">
                <a>Text Matching</a>
              </Link>
            </li>

            <li>
              <Link href="/genetic-algorithms/one-max">
                <a>One Max</a>
              </Link>
            </li>

            <li>
              <Link href="/genetic-algorithms/sorting-numbers">
                <a>Sorting Numbers</a>
              </Link>
            </li>

            <li>
              <Link href="/genetic-algorithms/queens">
                <a>Queens</a>
              </Link>
            </li>

            <li>
              <Link href="/genetic-algorithms/card-splitting">
                <a>Card Splitting</a>
              </Link>
            </li>

            <li>
              <Link href="/genetic-algorithms/knight-covering">
                <a>Knight Covering</a>
              </Link>
            </li>
          </ul>
        </main>
      </div>
    </PrimaryLayout>
  )
}
