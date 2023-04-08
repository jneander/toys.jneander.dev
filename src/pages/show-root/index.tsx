import {InternalLink, PrimaryLayout} from '../../shared/components'
import {renderPage} from '../render-page'

renderPage(() => (
  <PrimaryLayout>
    <main className="flow">
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
