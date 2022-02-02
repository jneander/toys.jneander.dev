import type {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'
import {ActivityStep} from './constants'
import type {ActivityStore} from './types'

export interface ActivityControllerConfig {
  activityStore: ActivityStore
  appController: AppController
}

export class ActivityController {
  private activityStore: ActivityStore
  private appController: AppController

  constructor(config: ActivityControllerConfig) {
    this.activityStore = config.activityStore
    this.appController = config.appController
  }

  finishPostSimulation(): void {
    this.appController.setActivityId(ActivityId.GenerationView)
  }

  setCurrentActivityStep(activityStep: ActivityStep): void {
    this.activityStore.setState({currentActivityStep: activityStep})
  }
}
