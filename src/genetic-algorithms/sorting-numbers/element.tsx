import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {Controller} from './controller'
import {SortingNumbers} from './sorting-numbers'

export class SortingNumbersElement extends HTMLElement {
  private controller?: Controller
  private eventBus: EventBus
  private root?: Root

  constructor() {
    super()

    this.eventBus = new EventBus()
  }

  connectedCallback() {
    this.controller = new Controller({eventBus: this.eventBus})

    const container = document.createElement('div')
    container.classList.add('flow')
    this.appendChild(container)

    this.root = createRoot(container)
    this.root.render(<SortingNumbers controller={this.controller} eventBus={this.eventBus} />)

    this.controller.initialize()
  }

  disconnectedCallback() {
    this.controller?.deinitialize()
    this.root?.unmount()
  }
}
