import type {EventBus} from '@jneander/event-bus'
import type {ArrayOrderFitnessValue} from '@jneander/genetics'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ControlsState, ExampleControls, State} from '../shared'

import styles from './styles.module.scss'

interface SortingNumbersProps {
  controlsStore: Store<ControlsState>
  eventBus: EventBus
  store: Store<State<number, ArrayOrderFitnessValue>>
}

export function SortingNumbers(props: SortingNumbersProps) {
  const {controlsStore, eventBus, store} = props

  const state = useStore(store)

  return (
    <div className={`${styles.Container} flow`}>
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

      <ExampleControls eventBus={eventBus} store={controlsStore} />
    </div>
  )
}
