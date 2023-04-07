import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'

export interface StartActivityProps {
  appController: AppController
}

export function StartActivity(props: StartActivityProps) {
  function handleCreateClick() {
    props.appController.generateCreatures()
    props.appController.setActivityId(ActivityId.GenerateCreatures)
  }

  return (
    <div>
      <h2>Evolution!</h2>

      <p>
        Since there are no creatures yet, create {CREATURE_COUNT} creatures! They will be randomly
        created, and also very simple.
      </p>

      <button onClick={handleCreateClick} type="button">
        Create
      </button>
    </div>
  )
}
