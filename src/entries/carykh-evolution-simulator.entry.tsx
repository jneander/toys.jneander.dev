import {createRoot, Root} from 'react-dom/client'

import {CarykhEvolutionSimulator} from '../simulations'

class CarykhEvolutionSimulatorElement extends HTMLElement {
  private root: Root | undefined

  connectedCallback() {
    this.root = createRoot(this)
    this.root.render(<CarykhEvolutionSimulator />)
  }

  disconnectedCallback() {
    this.root?.unmount()
  }
}

if (!customElements.get('carykh-evolution-simulator')) {
  window.customElements.define('carykh-evolution-simulator', CarykhEvolutionSimulatorElement)
}
