import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {SortingNumbers} from '../genetic-algorithms'

class SortingNumbersElement extends HTMLElement {
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<SortingNumbers eventBus={this.eventBus} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}

if (!customElements.get('sorting-numbers')) {
  window.customElements.define('sorting-numbers', SortingNumbersElement)
}
