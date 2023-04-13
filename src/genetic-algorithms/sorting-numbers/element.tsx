import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {createControlsStore} from '../shared'
import {Controller} from './controller'
import {SortingNumbers} from './sorting-numbers'

export class SortingNumbersElement extends HTMLElement {
  private controller?: Controller
  private root?: Root

  connectedCallback() {
    const controlsStore = createControlsStore()
    const eventBus = new EventBus()

    this.controller = new Controller({
      controlsStore,
      eventBus,
    })

    const container = document.createElement('div')
    container.classList.add('flow')
    this.appendChild(container)

    this.root = createRoot(container)
    this.root.render(
      <SortingNumbers
        controller={this.controller}
        controlsStore={controlsStore}
        eventBus={eventBus}
      />,
    )

    this.controller.initialize()
  }

  disconnectedCallback() {
    this.controller?.deinitialize()
    this.root?.unmount()
  }
}
