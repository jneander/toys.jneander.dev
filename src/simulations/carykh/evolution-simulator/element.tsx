import {AleaNumberGenerator} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'
import {createRoot, Root} from 'react-dom/client'

import {AppController} from './app-controller'
import {CarykhEvolutionSimulator} from './component'
import {ActivityId} from './constants'
import type {SimulationConfig} from './simulation'
import type {AppState} from './types'

export class CarykhEvolutionSimulatorElement extends HTMLElement {
  private controller: AppController | undefined
  private root: Root
  private store: Store<AppState> | undefined

  constructor() {
    super()

    this.root = createRoot(this)
  }

  connectedCallback() {
    this.store = new Store<AppState>({
      creaturesInLatestGeneration: [],
      currentActivityId: ActivityId.Start,
      generationCount: -1,
      generationHistoryMap: {},
      selectedGeneration: 0,
    })

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

    this.root.render(<CarykhEvolutionSimulator controller={this.controller} store={this.store} />)
  }

  disconnectedCallback() {
    this.root.unmount()
  }
}
