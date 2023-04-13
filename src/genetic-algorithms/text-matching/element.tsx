import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {Controller} from './controller'
import {TextMatching} from './text-matching'

export class TextMatchingElement extends HTMLElement {
  private controller: Controller | undefined
  private eventBus: EventBus
  private root: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
    this.root = createRoot(this)
  }

  connectedCallback() {
    this.controller = new Controller(this.eventBus)
    this.root.render(<TextMatching controller={this.controller} eventBus={this.eventBus} />)

    this.controller.initialize()
  }

  disconnectedCallback() {
    this.controller?.deinitialize()
    this.root.unmount()
  }
}
