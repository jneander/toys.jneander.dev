import type {AppController} from '../../app-controller'
import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface SimulationFinishedViewProps {
  activityController: ActivityController
  appController: AppController
}

export function SimulationFinishedView(props: SimulationFinishedViewProps) {
  const {activityController, appController} = props

  function handleSortClick() {
    appController.sortCreatures()
    appController.updateHistory()
    activityController.setCurrentActivityStep(ActivityStep.SortingCreatures)
  }

  return (
    <>
      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </>
  )
}
