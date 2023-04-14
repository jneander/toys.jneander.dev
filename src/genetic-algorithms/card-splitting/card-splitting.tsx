import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../shared/state'
import {ControlsState, ExampleControls, Metrics, State} from '../shared'
import {Cards} from './cards'
import type {CardSplittingFitnessValue} from './types'

interface CardSplittingProps {
  controlsStore: Store<ControlsState>
  eventBus: EventBus
  store: Store<State<string, CardSplittingFitnessValue>>
}

export function CardSplitting(props: CardSplittingProps) {
  const {controlsStore, eventBus, store} = props

  const state = useStore(store)

  return (
    <>
      {state.best && <Cards label="Best" record={state.best} />}

      {state.current && <Cards label="Current" record={state.current} />}

      <Metrics iteration={state.current?.iteration ?? 0} />

      <ExampleControls eventBus={eventBus} store={controlsStore} />
    </>
  )
}
