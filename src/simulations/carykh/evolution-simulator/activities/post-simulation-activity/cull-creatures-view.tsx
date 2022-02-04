import type {AppController} from '../../app-controller'
import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface CullCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
}

export function CullCreaturesView(props: CullCreaturesViewProps) {
  const {activityController, appController} = props

  function handlePropagateClick() {
    appController.propagateCreatures()
    activityController.setCurrentActivityStep(ActivityStep.PropagateCreatures)
  }

  return (
    <div>
      <p>
        Faster creatures are more likely to survive because they can outrun
        their predators. Slow creatures get eaten.
      </p>

      <p>
        Because of random chance, a few fast ones get eaten, while a few slow
        ones survive.
      </p>

      <button onClick={handlePropagateClick} type="button">
        Reproduce
      </button>
    </div>
  )
}
