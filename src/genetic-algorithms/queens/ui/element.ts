import '../../shared/chess-board/chess-board-element'
import '../../shared/example-config/element'
import '../../shared/example-controls/element'
import './configuration-element'

import {EventBus} from '@jneander/event-bus'
import {html} from 'lit'

import {BaseElement} from '../../../shared/views'
import {createControlsStore} from '../../shared'
import {Controller} from '../controller'
import {createStore} from '../state'

import styles from '../styles.module.scss'

export class QueensElement extends BaseElement {
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
    if (this.store == null || this.controlsStore == null) {
      return
    }

    const {boardSize, current} = this.store.getState()
    const {isRunning} = this.controlsStore.getState()

    const handleBoardSizeChange = (size: number) => {
      this.controller?.setBoardSize(size)
    }

    return html`
      <example-config .eventBus=${this.eventBus} .store=${this.controlsStore}></example-config>

      <div class="${styles.Container} flow">
        <queens-configuration
          boardSize=${boardSize}
          ?disabled=${isRunning}
          .onBoardSizeChange=${handleBoardSizeChange}
        ></queens-configuration>

        <div>
          <chess-board .positions=${current?.chromosome?.genes} size=${boardSize}></chess-board>
        </div>

        <div>Iteration: ${current?.iteration ?? 0}</div>
      </div>

      <example-controls .eventBus=${this.eventBus} .store=${this.controlsStore}></example-controls>
    `
  }
}
