import {render, unmountComponentAtNode} from 'react-dom'

import {KnightCovering} from '../genetic-algorithms'

class KnightCoveringElement extends HTMLElement {
  connectedCallback() {
    render(<KnightCovering />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('knight-covering')) {
  window.customElements.define('knight-covering', KnightCoveringElement)
}
