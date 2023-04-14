import {Store} from '@jneander/utils-state'

import type {ChessBoardPosition, State} from '../shared'

export function createStore(): Store<State<ChessBoardPosition, number>> {
  return new Store<State<ChessBoardPosition, number>>({
    best: null,
    current: null,
    first: null,
    target: null,
  })
}
