import type {ArrayOrderFitnessValue} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import type {State} from '../shared'

export function createStore(): Store<State<number, ArrayOrderFitnessValue>> {
  return new Store<State<number, ArrayOrderFitnessValue>>({
    best: null,
    current: null,
    first: null,
    target: null,
  })
}
