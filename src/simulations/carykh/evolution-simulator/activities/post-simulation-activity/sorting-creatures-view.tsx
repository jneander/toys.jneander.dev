import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface SortingCreaturesViewProps {
  activityController: ActivityController
}

export function SortingCreaturesView(props: SortingCreaturesViewProps) {
  const {activityController} = props

  function handleSkipClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
  }

  return (
    <>
      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </>
  )
}
