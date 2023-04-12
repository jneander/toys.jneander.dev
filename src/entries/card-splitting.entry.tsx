import {createRoot, Root} from 'react-dom/client'

import {CardSplitting} from '../genetic-algorithms'

class CardSplittingElement extends HTMLElement {
  private root: Root | undefined

  connectedCallback() {
    this.root = createRoot(this)
    this.root.render(<CardSplitting />)
  }

  disconnectedCallback() {
    this.root?.unmount()
  }
}

if (!customElements.get('card-splitting')) {
  window.customElements.define('card-splitting', CardSplittingElement)
}
