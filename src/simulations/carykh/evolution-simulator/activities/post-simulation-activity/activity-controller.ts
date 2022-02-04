import type {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'
import type {CreatureAndGridIndex} from '../../creature-collection-view'
import {creatureIdToIndex} from '../../creatures'
import type {AppStore} from '../../types'
import {ActivityStep} from './constants'
import type {ActivityStore} from './types'

export interface ActivityControllerConfig {
  activityStore: ActivityStore
  appController: AppController
  appStore: AppStore
}

export class ActivityController {
  private activityStore: ActivityStore
  private appController: AppController
  private appStore: AppStore

  constructor(config: ActivityControllerConfig) {
    this.activityStore = config.activityStore
    this.appController = config.appController
    this.appStore = config.appStore
  }

  getCreatureAndGridIndex(index: number): CreatureAndGridIndex {
    let creature = this.appStore.getState().creaturesInLatestGeneration[index]
    let gridIndex = index

    const {currentActivityStep} = this.activityStore.getState()
    if (currentActivityStep === ActivityStep.SimulationFinished) {
      gridIndex = creatureIdToIndex(creature.id)
    }

    return {creature, gridIndex}
  }

  currentStepShowsPopupSimulation(): boolean {
    const {currentActivityStep} = this.activityStore.getState()
    return currentActivityStep !== ActivityStep.PropagateCreatures
  }

  finishPostSimulation(): void {
    this.appController.setActivityId(ActivityId.GenerationView)
  }

  setCurrentActivityStep(activityStep: ActivityStep): void {
    this.activityStore.setState({currentActivityStep: activityStep})
  }
}
