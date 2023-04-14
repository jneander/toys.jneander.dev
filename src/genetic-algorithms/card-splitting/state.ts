import {Store} from '@jneander/utils-state'

import type {State} from '../shared'
import type {CardSplittingFitnessValue} from './types'

export function createStore(): Store<State<string, CardSplittingFitnessValue>> {
  return new Store<State<string, CardSplittingFitnessValue>>({
    best: null,
    current: null,
    first: null,
    target: null,
  })
}
