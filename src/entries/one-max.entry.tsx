import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {OneMax} from '../genetic-algorithms'

class OneMaxElement extends HTMLElement {
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<OneMax eventBus={this.eventBus} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('one-max')) {
  window.customElements.define('one-max', OneMaxElement)
}
