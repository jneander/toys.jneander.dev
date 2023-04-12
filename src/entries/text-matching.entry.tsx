import {createRoot, Root} from 'react-dom/client'

import {TextMatching} from '../genetic-algorithms'

class TextMatchingElement extends HTMLElement {
  private root: Root | undefined

  connectedCallback() {
    this.root = createRoot(this)
    this.root.render(<TextMatching />)
  }

  disconnectedCallback() {
    this.root?.unmount()
  }
}

if (!customElements.get('text-matching')) {
  window.customElements.define('text-matching', TextMatchingElement)
}
