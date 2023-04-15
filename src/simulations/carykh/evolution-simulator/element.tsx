import './activities/generate-creatures-activity.element'
import './activities/generation-view-activity/element'
import './activities/post-simulation-activity/element'
import './activities/simulation-running-activity/element'
import './activities/start-activity.element'

import {AleaNumberGenerator} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'
import {html, LitElement} from 'lit'

import {AppController} from './app-controller'
import {ActivityId} from './constants'
import type {SimulationConfig} from './simulation'
import type {AppState} from './types'

export class CarykhEvolutionSimulatorElement extends LitElement {
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

  createRenderRoot() {
    return this
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

    if (currentActivityId === ActivityId.GenerateCreatures) {
      return html`<generate-creatures-activity
        .controller=${this.controller}
        .store=${this.store}
      ></generate-creatures-activity>`
    }

    if (currentActivityId === ActivityId.GenerationView) {
      return html`<generation-view-activity
        .controller=${this.controller}
        .store=${this.store}
      ></generation-view-activity>`
    }

    if (currentActivityId === ActivityId.SimulationRunning) {
      return html`<simulation-running-activity
        .controller=${this.controller}
        .store=${this.store}
      ></simulation-running-activity>`
    }

    if (currentActivityId === ActivityId.PostSimulation) {
      return html`<post-simulation-activity
        .controller=${this.controller}
        .store=${this.store}
      ></post-simulation-activity>`
    }

    return html`<start-activity .controller=${this.controller}></start-activity>`
  }

  private handleStoreUpdate() {
    const previousActivityId = this.currentActivityId
    this.currentActivityId = this.store.getState().currentActivityId

    if (this.currentActivityId !== previousActivityId) {
      this.requestUpdate()
    }
  }
}
