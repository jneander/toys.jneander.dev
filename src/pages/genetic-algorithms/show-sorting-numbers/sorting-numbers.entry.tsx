import {render, unmountComponentAtNode} from 'react-dom'

import {SortingNumbers} from '../../../genetic-algorithms'

class SortingNumbersElement extends HTMLElement {
  connectedCallback() {
    render(<SortingNumbers />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('sorting-numbers')) {
  window.customElements.define('sorting-numbers', SortingNumbersElement)
}
