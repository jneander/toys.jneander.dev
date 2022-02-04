import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {SortingCreaturesAdapter} from './sorting-creatures-adapter'

export {SortingCreaturesAdapter}

export interface SortingCreaturesViewProps {
  activityController: ActivityController
}

export function SortingCreaturesView(props: SortingCreaturesViewProps) {
  const {activityController} = props

  function handleSkipClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
  }

  return (
    <div>
      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </div>
  )
}
