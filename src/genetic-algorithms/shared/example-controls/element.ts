import '../../../shared/components/inputs/checkbox-input.element'
import '../../../shared/components/inputs/number-input.element'
import '../../../shared/components/inputs/range-input.element'

import type {IEventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../shared/views'
import {ControlsEvent} from '../constants'
import type {ControlsState} from '../types'

import styles from './styles.module.scss'

export class ExampleControlsElement extends BaseElement {
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
    const {
      allIterations,
      isRunning,
      iterationCount,
      maxPropagationSpeed,
      playbackPosition,
      propagationSpeed,
    } = this.store.getState()

    return html`
      <div class="${styles.Container} flow">
        <checkbox-input-field
          ?checked=${maxPropagationSpeed}
          labelText="Max Speed"
          @input=${this.handleToggleMaxPropagationSpeed}
        ></checkbox-input-field>

        <number-input-field
          labelText="Iterations Per Second"
          ?disabled=${maxPropagationSpeed}
          max=${1000}
          min=${1}
          @input=${this.handleChangePropagationSpeed}
          step=${1}
          value=${propagationSpeed}
        ></number-input-field>

        <checkbox-input-field
          ?checked=${allIterations}
          ?disabled=${isRunning}
          labelText="Record Iterations"
          @input=${this.handleToggleRecordAllIterations}
        ></checkbox-input-field>

        <range-input-field
          ?disabled=${!allIterations || isRunning}
          labelText="Current Iteration"
          max=${iterationCount}
          min=${1}
          @input=${this.handleRangeChange}
          .value=${playbackPosition}
        ></range-input-field>

        <div class=${styles.ExampleControlsRow}>
          <button ?disabled=${isRunning} @click=${this.handleReset}>Reset</button>

          <button ?disabled=${isRunning} @click=${this.handleIterate}>Iterate</button>

          ${isRunning
            ? html`<button @click=${this.handleStop}>Pause</button>`
            : html`<button @click=${this.handleStart}>Start</button>`}
        </div>
      </div>
    `
  }

  private handleIterate() {
    this.eventBus.publish(ControlsEvent.ITERATE)
  }

  private handleReset() {
    this.eventBus.publish(ControlsEvent.RESET)
  }

  private handleRangeChange(event: Event) {
    const position = Number.parseInt((event.target as HTMLInputElement).value, 10)
    this.eventBus.publish(ControlsEvent.SET_PLAYBACK_POSITION, position)
  }

  private handleToggleMaxPropagationSpeed(event: Event) {
    this.eventBus.publish(
      ControlsEvent.SET_MAX_PROPAGATION_SPEED_ENABLED,
      (event.target as HTMLInputElement).checked,
    )
  }

  private handleChangePropagationSpeed(event: Event) {
    const speed = Number.parseInt((event.target as HTMLInputElement).value, 10)
    this.eventBus.publish(ControlsEvent.SET_PROPAGATION_SPEED, speed)
  }

  private handleToggleRecordAllIterations(event: Event) {
    this.eventBus.publish(
      ControlsEvent.SET_RECORD_ALL_ITERATIONS,
      (event.target as HTMLInputElement).checked,
    )
  }

  private handleStart() {
    this.eventBus.publish(ControlsEvent.START)
  }

  private handleStop() {
    this.eventBus.publish(ControlsEvent.STOP)
  }
}

defineElement('example-controls', ExampleControlsElement)
