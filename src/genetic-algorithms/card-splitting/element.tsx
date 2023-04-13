import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {CardSplitting} from './card-splitting'
import {Controller} from './controller'

export class CardSplittingElement extends HTMLElement {
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
    this.root.render(<CardSplitting controller={this.controller} eventBus={this.eventBus} />)

    this.controller.initialize()
  }

  disconnectedCallback() {
    this.controller?.deinitialize()
    this.root.unmount()
  }
}
