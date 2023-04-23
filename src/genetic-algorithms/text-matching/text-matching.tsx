import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ControlsState, ExampleControls, State} from '../shared'

import styles from './styles.module.scss'

interface TextMatchingProps {
  controlsStore: Store<ControlsState>
  eventBus: EventBus
  store: Store<State<string, number>>
}

export function TextMatching(props: TextMatchingProps) {
  const {controlsStore, eventBus, store} = props

  const state = useStore(store)

  return (
    <div className={`${styles.Container} flow`}>
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
    </div>
  )
}
