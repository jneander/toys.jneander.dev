import {InternalLink, PrimaryLayout} from '../../../../shared/components'
import {renderPage} from '../../../render-page'

renderPage(() => (
  <PrimaryLayout>
    <main>
      <h1>{"Carykh's Simulations"}</h1>

      <ul>
        <li>
          <InternalLink href="/simulations/carykh/evolution-simulator">
            Evolution Simulator
          </InternalLink>
        </li>
      </ul>
    </main>
  </PrimaryLayout>
))
