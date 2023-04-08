import {Breadcrumb, InternalLink, PrimaryLayout} from '../../../../shared/components'
import {renderPage} from '../../../render-page'

renderPage(() => (
  <PrimaryLayout>
    <div className="flow">
      <Breadcrumb>
        <InternalLink href="/">Home</InternalLink>

        <InternalLink href="/simulations">Simulations</InternalLink>

        <span>carykh</span>
      </Breadcrumb>

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
    </div>
  </PrimaryLayout>
))
