import type {Store} from '@jneander/utils-state'

import type {GenerationSimulation} from '../../simulation'
import type {GenerationSimulationMode} from './constants'

export type ActivityState = {
  currentGenerationSimulation: GenerationSimulation | null
  generationSimulationMode: GenerationSimulationMode
  pendingGenerationCount: number
}

export type ActivityStore = Store<ActivityState>
