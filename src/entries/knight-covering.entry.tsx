import {createRoot, Root} from 'react-dom/client'

import {KnightCovering} from '../genetic-algorithms'

class KnightCoveringElement extends HTMLElement {
  private root: Root | undefined

  connectedCallback() {
    this.root = createRoot(this)
    this.root.render(<KnightCovering />)
  }

  disconnectedCallback() {
    this.root?.unmount()
  }
}

if (!customElements.get('knight-covering')) {
  window.customElements.define('knight-covering', KnightCoveringElement)
}
