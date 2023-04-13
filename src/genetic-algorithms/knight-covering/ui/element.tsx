import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {KnightCovering} from './component'

export class KnightCoveringElement extends HTMLElement {
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.root.render(<KnightCovering eventBus={this.eventBus} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}
