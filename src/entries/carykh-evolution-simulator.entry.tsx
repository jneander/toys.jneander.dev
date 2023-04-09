import {render, unmountComponentAtNode} from 'react-dom'

import {CarykhEvolutionSimulator} from '../simulations'

class CarykhEvolutionSimulatorElement extends HTMLElement {
  connectedCallback() {
    render(<CarykhEvolutionSimulator />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('carykh-evolution-simulator')) {
  window.customElements.define('carykh-evolution-simulator', CarykhEvolutionSimulatorElement)
}
