import type {EventBus} from '@jneander/event-bus'

import {useStore} from '../../shared/state'
import {ExampleControls, Metrics} from '../shared'
import {Cards} from './cards'
import type {Controller} from './controller'

import styles from './styles.module.scss'

interface CardSplittingProps {
  controller: Controller
  eventBus: EventBus
}

export function CardSplitting(props: CardSplittingProps) {
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

      <Metrics iteration={state.current?.iteration ?? 0} />

      <div className={styles.Dunno}>
        {state.current && <Cards label="Current" record={state.current} />}

        {state.best && <Cards label="Best" record={state.best} />}
      </div>
    </>
  )
}
