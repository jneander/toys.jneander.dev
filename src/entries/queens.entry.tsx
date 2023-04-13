import {createRoot, Root} from 'react-dom/client'

import {Queens} from '../genetic-algorithms'

class QueensElement extends HTMLElement {
  private root: Root

  constructor() {
    super()

    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<Queens />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('ga-queens')) {
  window.customElements.define('ga-queens', QueensElement)
}
