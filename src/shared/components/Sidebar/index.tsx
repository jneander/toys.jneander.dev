import Link from 'next/link'

import styles from './styles.module.css'

export default function Sidebar() {
  return (
    <nav className={styles.Sidebar}>
      <header>
        <Link href="/">
          <a>Home</a>
        </Link>
      </header>

      <ul className={styles.Nav}>
        <li>
          <Link href="/genetic-algorithms">
            <a>Genetic Algorithms</a>
          </Link>
        </li>
      </ul>

      <div className={styles.GithubLink}>
        <a href="https://github.com/jneander/cs.jneander.dev">View on Github</a>
      </div>
    </nav>
  )
}
