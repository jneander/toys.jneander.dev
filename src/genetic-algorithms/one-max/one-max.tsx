import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ControlsState, ExampleControls} from '../shared'
import type {Controller} from './controller'

interface OneMaxProps {
  controller: Controller
  controlsStore: Store<ControlsState>
  eventBus: EventBus
}

export function OneMax(props: OneMaxProps) {
  const {controller, controlsStore, eventBus} = props

  const state = useStore(controller.store)

  return (
    <>
      <ExampleControls eventBus={eventBus} store={controlsStore} />

      <div>
        <ChromosomeTable
          best={state.best}
          current={state.current}
          first={state.first}
          formatGenes={genes => genes.join('')}
          target={state.target}
        />
      </div>
    </>
  )
}
