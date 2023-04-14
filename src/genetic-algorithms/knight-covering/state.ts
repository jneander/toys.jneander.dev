import {Store} from '@jneander/utils-state'

import {DEFAULT_BOARD_SIZE} from './constants'
import type {KnightCoveringState} from './types'

export function createStore(): Store<KnightCoveringState> {
  return new Store<KnightCoveringState>({
    best: null,
    current: null,
    first: null,
    target: null,
    boardSize: DEFAULT_BOARD_SIZE,
  })
}
