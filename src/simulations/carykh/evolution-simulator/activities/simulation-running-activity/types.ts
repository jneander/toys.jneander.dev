import type {Store} from '@jneander/utils-state'

export type ActivityState = {
  timer: number
}

export type ActivityStore = Store<ActivityState>
