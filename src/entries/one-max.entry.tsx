import {createRoot, Root} from 'react-dom/client'

import {OneMax} from '../genetic-algorithms'

class OneMaxElement extends HTMLElement {
  private root: Root

  constructor() {
    super()

    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<OneMax />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('one-max')) {
  window.customElements.define('one-max', OneMaxElement)
}
