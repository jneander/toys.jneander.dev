import type {Store} from '@jneander/utils-state'

export type ActivityState = {
  simulationSpeed: number
  timer: number
}

export type ActivityStore = Store<ActivityState>
