import {createRoot, Root} from 'react-dom/client'

import {SortingNumbers} from '../genetic-algorithms'

class SortingNumbersElement extends HTMLElement {
  private root: Root | undefined

  connectedCallback() {
    this.root = createRoot(this)
    this.root.render(<SortingNumbers />)
  }

  disconnectedCallback() {
    this.root?.unmount()
  }
}

if (!customElements.get('sorting-numbers')) {
  window.customElements.define('sorting-numbers', SortingNumbersElement)
}
