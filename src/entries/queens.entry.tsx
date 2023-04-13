import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {Queens} from '../genetic-algorithms'

class QueensElement extends HTMLElement {
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<Queens eventBus={this.eventBus} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('ga-queens')) {
  window.customElements.define('ga-queens', QueensElement)
}
