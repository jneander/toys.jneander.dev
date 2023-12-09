import type {Store} from '@jneander/utils-state'

import type {ActivityStep} from './constants'

export type ActivityState = {
  currentActivityStep: ActivityStep
}

export type ActivityStore = Store<ActivityState>
