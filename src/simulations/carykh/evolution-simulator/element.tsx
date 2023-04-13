import {createRoot, Root} from 'react-dom/client'

import {CarykhEvolutionSimulator} from './component'

export class CarykhEvolutionSimulatorElement extends HTMLElement {
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
