import '../shared/example-controls/element'
import './cards-group'

import {EventBus} from '@jneander/event-bus'
import {html} from 'lit'

import {BaseElement} from '../../shared/views'
import {createControlsStore} from '../shared'
import {Controller} from './controller'
import {createStore} from './state'

import styles from './styles.module.scss'

export class CardSplittingElement extends BaseElement {
  private controller?: Controller
  private controlsStore?: ReturnType<typeof createControlsStore>
  private eventBus?: EventBus
  private store?: ReturnType<typeof createStore>
  private storeListeners: (() => void)[] = []

  connectedCallback() {
    this.controlsStore = createControlsStore()
    this.eventBus = new EventBus()
    this.store = createStore()

    this.controller = new Controller({
      controlsStore: this.controlsStore,
      eventBus: this.eventBus,
      store: this.store,
    })

    this.storeListeners.push(
      this.controlsStore.subscribe(() => {
        this.requestUpdate()
      }),

      this.store.subscribe(() => {
        this.requestUpdate()
      }),
    )

    this.controller.initialize()

    super.connectedCallback()
  }

  disconnectedCallback() {
    this.storeListeners.forEach(fn => {
      fn()
    })
    this.storeListeners.length = 0

    this.controller?.deinitialize()

    super.disconnectedCallback()
  }

  protected render() {
    if (this.store == null) {
      return
    }

    const {best, current} = this.store.getState()

    return html`
      <div class="${styles.Container} flow">
        ${best ? html`<cards-group label="Best" .record=${best}></cards-group>` : null}
        ${current ? html`<cards-group label="Current" .record=${current}></cards-group>` : null}

        <div>Iteration: ${current?.iteration ?? 0}</div>

        <example-controls
          .eventBus=${this.eventBus}
          .store=${this.controlsStore}
        ></example-controls>
      </div>
    `
  }
}
