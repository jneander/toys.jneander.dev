import {EventBus} from '@jneander/event-bus'
import {useEffect, useMemo} from 'react'

import {useStore} from '../../shared/state'
import {ExampleControls, Metrics} from '../shared'
import {Cards} from './cards'
import {Controller} from './controller'

import styles from './styles.module.scss'

export function CardSplitting() {
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
        playing={state.isRunning}
        propagationSpeed={state.propagationSpeed}
        rangePosition={state.playbackPosition}
        rangePositionCount={state.iterationCount}
        recordAllIterations={state.allIterations}
      />

      <Metrics iteration={state.current?.iteration ?? 0} />

      <div className={styles.Dunno}>
        {state.current && <Cards label="Current" record={state.current} />}

        {state.best && <Cards label="Best" record={state.best} />}
      </div>
    </div>
  )
}
