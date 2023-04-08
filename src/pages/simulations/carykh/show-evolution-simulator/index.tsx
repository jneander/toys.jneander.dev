import {PrimaryLayout} from '../../../../shared/components'
import {CarykhEvolutionSimulator} from '../../../../simulations'
import {renderPage} from '../../../render-page'

renderPage(() => (
  <PrimaryLayout>
    <main className="flow">
      <h1>{"Carykh's Evolution Simulator"}</h1>

      <CarykhEvolutionSimulator />
    </main>
  </PrimaryLayout>
))
