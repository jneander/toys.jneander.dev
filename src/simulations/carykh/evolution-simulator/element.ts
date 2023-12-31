import './activities/generate-creatures-activity.element'
import './activities/generation-view-activity/element'
import './activities/post-simulation-activity/element'
import './activities/simulation-running-activity/element'
import './activities/start-activity.element'

import {AleaNumberGenerator} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement} from '../../../shared/views'
import {AppController} from './app-controller'
import {ActivityId} from './constants'
import type {SimulationConfig} from './simulation'
import type {AppState} from './types'

import styles from './styles.module.scss'

export class CarykhEvolutionSimulatorElement extends BaseElement {
  private controller?: AppController
  private store: Store<AppState>

  private currentActivityId: ActivityId
  private unsubscribeHandleStoreUpdate?: () => void

  constructor() {
    super()

    this.currentActivityId = ActivityId.Start

    this.store = new Store<AppState>({
      creaturesInLatestGeneration: [],
      currentActivityId: this.currentActivityId,
      generationCount: -1,
      generationHistoryMap: {},
      selectedGeneration: 0,
    })
  }

  connectedCallback() {
    this.unsubscribeHandleStoreUpdate = this.store.subscribe(this.handleStoreUpdate.bind(this))

    const SEED = 0
    const randomNumberGenerator = new AleaNumberGenerator({seed: SEED})

    const simulationConfig: SimulationConfig = {
      hazelStairs: -1,
    }

    this.controller = new AppController({
      appStore: this.store,
      randomNumberGenerator,
      simulationConfig,
    })

    this.innerHTML = ''
    super.connectedCallback()
  }

  disconnectedCallback() {
    this.unsubscribeHandleStoreUpdate?.()
    delete this.unsubscribeHandleStoreUpdate
    super.disconnectedCallback()
  }

  render() {
    const {currentActivityId} = this.store.getState()

    let activityContent

    if (currentActivityId === ActivityId.GenerateCreatures) {
      activityContent = html`<generate-creatures-activity
        .controller=${this.controller}
        .store=${this.store}
      ></generate-creatures-activity>`
    }

    if (currentActivityId === ActivityId.GenerationView) {
      activityContent = html`<generation-view-activity
        .controller=${this.controller}
        .store=${this.store}
      ></generation-view-activity>`
    }

    if (currentActivityId === ActivityId.SimulationRunning) {
      activityContent = html`<simulation-running-activity
        .controller=${this.controller}
        .store=${this.store}
      ></simulation-running-activity>`
    }

    if (currentActivityId === ActivityId.PostSimulation) {
      activityContent = html`<post-simulation-activity
        .controller=${this.controller}
        .store=${this.store}
      ></post-simulation-activity>`
    }

    if (currentActivityId === ActivityId.Start) {
      activityContent = html`<start-activity .controller=${this.controller}></start-activity>`
    }

    return html`<div class=${styles.Container}>${activityContent}</div>`
  }

  private handleStoreUpdate() {
    const previousActivityId = this.currentActivityId
    this.currentActivityId = this.store.getState().currentActivityId

    if (this.currentActivityId !== previousActivityId) {
      this.requestUpdate()
    }
  }
}
