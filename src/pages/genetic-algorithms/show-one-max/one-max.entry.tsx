import {render, unmountComponentAtNode} from 'react-dom'

import {OneMax} from '../../../genetic-algorithms'

class OneMaxElement extends HTMLElement {
  connectedCallback() {
    render(<OneMax />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('one-max')) {
  window.customElements.define('one-max', OneMaxElement)
}
