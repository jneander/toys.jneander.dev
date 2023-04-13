import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {CardSplitting} from '../genetic-algorithms'

class CardSplittingElement extends HTMLElement {
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<CardSplitting eventBus={this.eventBus} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('card-splitting')) {
  window.customElements.define('card-splitting', CardSplittingElement)
}
