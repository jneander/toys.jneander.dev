import {Store} from '@jneander/utils-state'

import {DEFAULT_BOARD_SIZE} from './constants'
import type {QueensState} from './types'

export function createStore(): Store<QueensState> {
  return new Store<QueensState>({
    best: null,
    current: null,
    first: null,
    target: null,
    boardSize: DEFAULT_BOARD_SIZE,
  })
}
