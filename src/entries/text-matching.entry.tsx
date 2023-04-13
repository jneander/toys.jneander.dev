import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {TextMatching} from '../genetic-algorithms'

class TextMatchingElement extends HTMLElement {
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<TextMatching eventBus={this.eventBus} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('text-matching')) {
  window.customElements.define('text-matching', TextMatchingElement)
}
