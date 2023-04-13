import type {EventBus} from '@jneander/event-bus'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ExampleControls} from '../shared'
import type {Controller} from './controller'

interface OneMaxProps {
  controller: Controller
  eventBus: EventBus
}

export function OneMax(props: OneMaxProps) {
  const {controller, eventBus} = props

  const state = useStore(controller.store)

  return (
    <>
      <ExampleControls
        eventBus={eventBus}
        maxPropagationSpeed={state.maxPropagationSpeed}
        playing={state.isRunning}
        propagationSpeed={state.propagationSpeed}
        rangePosition={state.playbackPosition}
        rangePositionCount={state.iterationCount}
        recordAllIterations={state.allIterations}
      />

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
