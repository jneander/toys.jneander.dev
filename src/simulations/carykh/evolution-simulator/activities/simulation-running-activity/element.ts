import '../../p5-utils/p5-view-element'

import {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import {SIMULATION_SPEED_INITIAL} from '../../constants'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {SimulationRunningAdapter} from './simulation-running-adapter'
import type {ActivityState} from './types'

import styles from './styles.module.scss'

export class SimulationRunningActivityElement extends BaseElement {
  public declare controller: AppController
  public declare store: AppStore

  private activityController?: ActivityController
  private activityStore?: Store<ActivityState>
  private clientViewAdapter?: SimulationRunningAdapter

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  connectedCallback(): void {
    this.activityStore = new Store<ActivityState>({
      simulationSpeed: SIMULATION_SPEED_INITIAL,
      timer: 0,
    })

    this.activityController = new ActivityController({
      activityStore: this.activityStore,
      appController: this.controller,
      appStore: this.store,
    })

    this.clientViewAdapter = new SimulationRunningAdapter({
      activityController: this.activityController,
      appController: this.controller,
    })

    super.connectedCallback()
  }

  protected render(): unknown {
    const {simulationSpeed} = this.activityStore?.getState() ?? {}

    return html`
      <div>
        <div class=${styles.Container}>
          <p5-view .clientViewAdapter=${this.clientViewAdapter} />
        </div>

        <button @click=${this.handleSkipClick} type="button">Skip</button>

        <button @click=${this.handlePlaybackSpeedClick} type="button">
          Playback Speed: x${simulationSpeed}
        </button>

        <button @click=${this.handleFinishClick} type="button">Finish</button>
      </div>
    `
  }

  private handleSkipClick(): void {
    this.activityController?.advanceGenerationSimulation()
  }

  private handlePlaybackSpeedClick(): void {
    this.activityController?.increaseSimulationSpeed()
    this.requestUpdate()
  }

  private handleFinishClick(): void {
    this.activityController?.finishGenerationSimulation()
  }
}

defineElement('simulation-running-activity', SimulationRunningActivityElement)
