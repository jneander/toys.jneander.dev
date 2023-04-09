import {render, unmountComponentAtNode} from 'react-dom'

import {TextMatching} from '../../../genetic-algorithms'

class TextMatchingElement extends HTMLElement {
  connectedCallback() {
    render(<TextMatching />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('text-matching')) {
  window.customElements.define('text-matching', TextMatchingElement)
}
