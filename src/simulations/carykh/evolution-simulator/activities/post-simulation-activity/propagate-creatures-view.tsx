import {CREATURE_COUNT} from '../../constants'
import type {AppStore} from '../../types'
import type {ActivityController} from './activity-controller'

export interface PropagateCreaturesViewProps {
  activityController: ActivityController
  appStore: AppStore
}

export function PropagateCreaturesView(props: PropagateCreaturesViewProps) {
  const {activityController, appStore} = props

  function handleBackClick() {
    activityController.finishPostSimulation()
  }

  return (
    <>
      <p>
        These are the {CREATURE_COUNT} creatures of generation #
        {appStore.getState().generationCount + 1}.
      </p>

      <p>What perils will they face? Find out next time!</p>

      <button onClick={handleBackClick} type="button">
        Back
      </button>
    </>
  )
}
