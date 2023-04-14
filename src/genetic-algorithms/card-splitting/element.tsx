import {EventBus} from '@jneander/event-bus'
import {createRoot, Root} from 'react-dom/client'

import {createControlsStore} from '../shared'
import {CardSplitting} from './card-splitting'
import {Controller} from './controller'
import {createStore} from './state'

export class CardSplittingElement extends HTMLElement {
  private controller?: Controller
  private root?: Root

  connectedCallback() {
    const controlsStore = createControlsStore()
    const eventBus = new EventBus()
    const store = createStore()

    this.controller = new Controller({
      controlsStore,
      eventBus,
      store,
    })

    const container = document.createElement('div')
    container.classList.add('flow')
    this.appendChild(container)

    this.root = createRoot(container)
    this.root.render(
      <CardSplitting controlsStore={controlsStore} eventBus={eventBus} store={store} />,
    )

    this.controller.initialize()
  }

  disconnectedCallback() {
    this.controller?.deinitialize()
    this.root?.unmount()
  }
}
