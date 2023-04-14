import type {AppController} from '../../app-controller'
import {CREATURE_COUNT} from '../../constants'
import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface SortedCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
}

export function SortedCreaturesView(props: SortedCreaturesViewProps) {
  const {activityController, appController} = props

  function handleCullClick() {
    appController.cullCreatures()
    activityController.setCurrentActivityStep(ActivityStep.CullCreatures)
  }

  return (
    <>
      <p>Fastest creatures at the top! Slowest creatures at the bottom. (Going backward = slow)</p>

      <button onClick={handleCullClick} type="button">
        Kill {Math.floor(CREATURE_COUNT / 2)}
      </button>
    </>
  )
}
