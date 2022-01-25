import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'

export interface StartActivityProps {
  appController: AppController
}

export function StartActivity(props: StartActivityProps) {
  function handleStartClick() {
    props.appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div>
      <h2>Evolution!</h2>

      <button onClick={handleStartClick} type="button">
        Start
      </button>
    </div>
  )
}
