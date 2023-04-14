import {Store} from '@jneander/utils-state'

import type {State} from '../shared'

export function createStore(): Store<State<string, number>> {
  return new Store<State<string, number>>({
    best: null,
    current: null,
    first: null,
    target: null,
  })
}
