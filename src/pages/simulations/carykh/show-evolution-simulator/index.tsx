import {Breadcrumb, InternalLink, PrimaryLayout} from '../../../../shared/components'
import {CarykhEvolutionSimulator} from '../../../../simulations'
import {renderPage} from '../../../render-page'

const PAGE_NAME = "Carykh's Evolution Simulator"

renderPage(() => (
  <PrimaryLayout>
    <div className="flow">
      <Breadcrumb>
        <InternalLink href="/">Home</InternalLink>

        <span>Simulations</span>

        <span>carykh</span>

        <span>{PAGE_NAME}</span>
      </Breadcrumb>

      <main className="flow">
        <h1>{PAGE_NAME}</h1>

        <CarykhEvolutionSimulator />
      </main>
    </div>
  </PrimaryLayout>
))
