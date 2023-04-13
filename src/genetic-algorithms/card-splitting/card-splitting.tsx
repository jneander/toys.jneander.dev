import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../shared/state'
import {ControlsState, ExampleControls, Metrics} from '../shared'
import {Cards} from './cards'
import type {Controller} from './controller'

import styles from './styles.module.scss'

interface CardSplittingProps {
  controller: Controller
  controlsStore: Store<ControlsState>
  eventBus: EventBus
}

export function CardSplitting(props: CardSplittingProps) {
  const {controller, controlsStore, eventBus} = props

  const state = useStore(controller.store)

  return (
    <>
      <ExampleControls eventBus={eventBus} store={controlsStore} />

      <Metrics iteration={state.current?.iteration ?? 0} />

      <div className={styles.Dunno}>
        {state.current && <Cards label="Current" record={state.current} />}

        {state.best && <Cards label="Best" record={state.best} />}
      </div>
    </>
  )
}
