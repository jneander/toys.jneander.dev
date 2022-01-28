import type {Store} from '@jneander/utils-state'

import type {GenerationSimulationMode} from './constants'

export type ActivityState = {
  generationSimulationMode: GenerationSimulationMode
  pendingGenerationCount: number
}

export type ActivityStore = Store<ActivityState>
