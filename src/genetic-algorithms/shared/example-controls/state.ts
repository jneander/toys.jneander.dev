import {Store} from '@jneander/utils-state'

import type {ControlsState} from './types'

export function createControlsStore(): Store<ControlsState> {
  return new Store<ControlsState>({
    allIterations: false,
    isRunning: false,
    iterationCount: 0,
    maxPropagationSpeed: true,
    playbackPosition: 1,
    propagationSpeed: 1,
  })
}
