import type {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'

export interface ActivityControllerConfig {
  appController: AppController
}

export class ActivityController {
  private appController: AppController

  constructor(config: ActivityControllerConfig) {
    this.appController = config.appController
  }

  finishPostSimulation(): void {
    this.appController.setActivityId(ActivityId.GenerationView)
  }

  setActivityId(activityId: ActivityId): void {
    this.appController.setActivityId(activityId)
  }
}
