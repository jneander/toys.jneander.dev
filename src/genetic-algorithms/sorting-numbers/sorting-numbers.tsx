import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ControlsState, ExampleControls} from '../shared'
import type {Controller} from './controller'

interface SortingNumbersProps {
  controller: Controller
  controlsStore: Store<ControlsState>
  eventBus: EventBus
}

export function SortingNumbers(props: SortingNumbersProps) {
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
          formatFitness={({gap, ordered}) => `${ordered},${gap}`}
          formatGenes={genes => genes.join(', ')}
          target={state.target}
        />
      </div>
    </>
  )
}
