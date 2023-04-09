import {render, unmountComponentAtNode} from 'react-dom'

import {CardSplitting} from '../../../genetic-algorithms'

class CardSplittingElement extends HTMLElement {
  connectedCallback() {
    render(<CardSplitting />, this)
  }

  disconnectedCallback() {
    unmountComponentAtNode(this)
  }
}

if (!customElements.get('card-splitting')) {
  window.customElements.define('card-splitting', CardSplittingElement)
}
