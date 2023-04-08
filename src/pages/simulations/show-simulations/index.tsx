import {Breadcrumb, InternalLink, PrimaryLayout} from '../../../shared/components'
import {renderPage} from '../../render-page'

renderPage(() => (
  <PrimaryLayout>
    <div className="flow">
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
))
