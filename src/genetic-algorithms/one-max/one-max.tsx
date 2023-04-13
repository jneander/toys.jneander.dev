import {EventBus} from '@jneander/event-bus'
import {useEffect, useMemo} from 'react'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ExampleControls} from '../shared'
import {Controller} from './controller'

export function OneMax() {
  const eventBus = useMemo(() => {
    return new EventBus()
  }, [])

  const controller = useMemo(() => {
    return new Controller(eventBus)
  }, [eventBus])

  const state = useStore(controller.store)

  useEffect(() => {
    controller.initialize()
    return controller.deinitialize.bind(controller)
  }, [controller])

  return (
    <div className="flow">
      <ExampleControls
        eventBus={eventBus}
        maxPropagationSpeed={state.maxPropagationSpeed}
        onRefresh={controller.randomizeTarget}
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
    </div>
  )
}
