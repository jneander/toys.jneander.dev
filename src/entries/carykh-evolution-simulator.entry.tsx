import {createRoot, Root} from 'react-dom/client'

import {CarykhEvolutionSimulator} from '../simulations'

class CarykhEvolutionSimulatorElement extends HTMLElement {
  private root: Root

  constructor() {
    super()

    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<CarykhEvolutionSimulator />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('carykh-evolution-simulator')) {
  window.customElements.define('carykh-evolution-simulator', CarykhEvolutionSimulatorElement)
}
