import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../../shared/state'
import {ChessBoard, ControlsState, ExampleControls, Metrics} from '../../shared'
import type {Controller} from '../controller'
import type {KnightCoveringState} from '../types'
import {Configuration} from './configuration'

import styles from '../styles.module.scss'

interface KnightCoveringProps {
  controller: Controller
  controlsStore: Store<ControlsState>
  eventBus: EventBus
  store: Store<KnightCoveringState>
}

export function KnightCovering(props: KnightCoveringProps) {
  const {controller, controlsStore, eventBus, store} = props

  const {boardSize, current} = useStore(store)
  const {isRunning} = useStore(controlsStore)

  function handleBoardSizeChange(size: number) {
    controller.setBoardSize(size)
  }

  return (
    <div className={`${styles.Container} flow`}>
      <Configuration
        boardSize={boardSize}
        disabled={isRunning}
        onBoardSizeChange={handleBoardSizeChange}
      />

      <div>
        <ChessBoard positions={current?.chromosome?.genes} size={boardSize} />
      </div>

      <Metrics iteration={current ? current.iteration : 0} />

      <ExampleControls eventBus={eventBus} store={controlsStore} />
    </div>
  )
}
