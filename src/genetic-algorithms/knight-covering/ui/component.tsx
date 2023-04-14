import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../../shared/state'
import {ChessBoard, ControlsState, ExampleControls, Metrics} from '../../shared'
import type {Controller} from '../controller'
import type {KnightCoveringState} from '../types'
import {Configuration} from './configuration'

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
    <>
      <ExampleControls eventBus={eventBus} store={controlsStore} />

      <Configuration
        boardSize={boardSize}
        disabled={isRunning}
        onBoardSizeChange={handleBoardSizeChange}
      />

      <Metrics iteration={current ? current.iteration : 0} />

      <div>
        <ChessBoard positions={current?.chromosome?.genes} size={boardSize} />
      </div>
    </>
  )
}
