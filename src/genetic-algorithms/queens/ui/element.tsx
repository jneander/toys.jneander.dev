import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {Queens} from './component'

export class QueensElement extends HTMLElement {
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
