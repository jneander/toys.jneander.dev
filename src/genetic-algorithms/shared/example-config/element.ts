import type {IEventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../shared/views'
import {ControlsEvent} from '../constants'
import type {ControlsState} from '../types'

import styles from './styles.module.scss'

export class ExampleConfig extends BaseElement {
  private declare eventBus: IEventBus
  private declare store: Store<ControlsState>

  private storeListeners: (() => void)[] = []

  connectedCallback() {
    this.storeListeners.push(
      this.store.subscribe(() => {
        this.requestUpdate()
      }),
    )

    super.connectedCallback()
  }

  disconnectedCallback() {
    this.storeListeners.forEach(fn => {
      fn()
    })
    this.storeListeners.length = 0

    super.disconnectedCallback()
  }

  protected render() {
    return html`
      <div class="${styles.Container}">
        <button @click=${this.handleRandomize}>Randomize</button>
      </div>
    `
  }

  private handleRandomize() {
    this.eventBus.publish(ControlsEvent.RANDOMIZE)
  }
}

defineElement('example-config', ExampleConfig)
