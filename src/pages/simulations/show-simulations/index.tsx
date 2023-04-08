import {InternalLink, PrimaryLayout} from '../../../shared/components'
import {renderPage} from '../../render-page'

renderPage(() => (
  <PrimaryLayout>
    <main className="flow">
      <h1>Simulations</h1>

      <ul>
        <li>
          <InternalLink href="/simulations/carykh">carykh</InternalLink>
        </li>
      </ul>
    </main>
  </PrimaryLayout>
))
