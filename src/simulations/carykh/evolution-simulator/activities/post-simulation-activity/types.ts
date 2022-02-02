import type {Store} from '@jneander/utils-state'

import type {Creature} from '../../creatures'

import {ActivityStep} from './constants'

export type ActivityState = {
  currentActivityStep: ActivityStep
}

export type ActivityStore = Store<ActivityState>

export type CreatureAndGridIndex = {
  creature: Creature
  gridIndex: number
}
