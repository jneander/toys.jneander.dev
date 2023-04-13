import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {TextMatching} from './text-matching'

export class TextMatchingElement extends HTMLElement {
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
