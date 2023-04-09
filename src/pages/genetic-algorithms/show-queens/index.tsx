import {render, unmountComponentAtNode} from 'react-dom'

import {Queens} from '../../../genetic-algorithms'

class QueensElement extends HTMLElement {
  connectedCallback() {
    render(<Queens />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('ga-queens')) {
  window.customElements.define('ga-queens', QueensElement)
}
