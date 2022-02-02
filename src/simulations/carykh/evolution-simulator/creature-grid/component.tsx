import type {Graphics} from 'p5'
import {useMemo, useRef} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {
  CreateUiFnParameters,
  P5UI,
  P5Wrapper,
  createSketchFn
} from '../p5-utils'
import type {AppStore} from '../types'
import {PopupSimulationView, PopupSimulationViewAnchor} from '../views'
import {
  CREATURE_GRID_MARGIN_X,
  CREATURE_GRID_MARGIN_Y,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH
} from './constants'
import {CreatureGridView, CreatureGridViewConfig} from './p5-view'

import styles from './styles.module.css'

export interface CreatureGridProps {
  appController: AppController
  appStore: AppStore
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
  showsPopupSimulation?: boolean
}

export function CreatureGrid(props: CreatureGridProps) {
  const {appController, appStore, getCreatureAndGridIndexFn} = props

  const propsRef = useRef(props)
  propsRef.current = props

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new CreatureGridP5UI({
        appController,
        appStore,
        getCreatureAndGridIndexFn,
        gridStartX: 40,
        gridStartY: 42,
        p5Wrapper,
        showsPopupSimulation: () => !!propsRef.current.showsPopupSimulation
      })
    }

    return createSketchFn({createUiFn})
  }, [appController, appStore, getCreatureAndGridIndexFn])

  return (
    <div className={styles.Container}>
      <P5ClientView sketch={sketchFn} />
    </div>
  )
}

interface CreatureGridP5UIConfig {
  appController: AppController
  appStore: AppStore
  p5Wrapper: P5Wrapper
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
  gridStartX: number
  gridStartY: number
  showsPopupSimulation: () => boolean
}

class CreatureGridP5UI implements P5UI {
  private appController: AppController
  private appStore: AppStore
  private p5Wrapper: P5Wrapper
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView

  private graphics: Graphics

  private gridStartX: number
  private gridStartY: number
  private showsPopupSimulation: () => boolean

  constructor(config: CreatureGridP5UIConfig) {
    this.appController = config.appController
    this.appStore = config.appStore
    this.p5Wrapper = config.p5Wrapper

    this.graphics = this.p5Wrapper.canvas.createGraphics(1920, 1080)

    this.gridStartX = config.gridStartX
    this.gridStartY = config.gridStartY
    this.showsPopupSimulation = config.showsPopupSimulation

    const {getCreatureAndGridIndexFn} = config

    this.creatureGridView = new CreatureGridView({
      getCreatureAndGridIndexFn,
      gridStartX: this.gridStartX,
      gridStartY: this.gridStartY,
      p5Wrapper: this.p5Wrapper,
      showsHoverState: this.showsPopupSimulation
    })

    this.popupSimulationView = new PopupSimulationView({
      p5Wrapper: this.p5Wrapper,
      simulationConfig: this.appController.getSimulationConfig()
    })
  }

  draw(): void {
    const {canvas, height, width} = this.p5Wrapper
    const {creatureGridView, graphics} = this

    canvas.image(graphics, 0, 0, width, height)

    const gridStartX = this.gridStartX - CREATURE_GRID_MARGIN_X
    const gridStartY = this.gridStartY - CREATURE_GRID_MARGIN_Y

    creatureGridView.draw()
    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    if (!this.showsPopupSimulation()) {
      return
    }

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor()

    if (gridIndex != null) {
      this.setPopupSimulationCreatureInfo(gridIndex)

      const anchor = this.calculateAnchorForPopupSimulation(gridIndex)
      this.popupSimulationView.setAnchor(anchor)

      this.popupSimulationView.draw()
    } else {
      this.clearPopupSimulation()
    }
  }

  onMousePressed(): void {}

  initialize(): void {
    this.graphics.background(220, 253, 102)
    this.creatureGridView.initialize()
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()
  }

  onMouseWheel(event: WheelEvent): void {}

  private setPopupSimulationCreatureInfo(
    generationCreatureIndex: number
  ): void {
    const creature =
      this.appStore.getState().creaturesInLatestGeneration[
        generationCreatureIndex
      ]

    this.popupSimulationView.setCreatureInfo({
      creature,
      rank: generationCreatureIndex + 1
    })
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView.setCreatureInfo(null)
  }

  private calculateAnchorForPopupSimulation(
    gridIndex: number
  ): PopupSimulationViewAnchor {
    let creatureRowIndex, creatureColumnIndex

    creatureRowIndex = gridIndex % CREATURE_GRID_TILES_PER_ROW
    creatureColumnIndex = Math.floor(gridIndex / CREATURE_GRID_TILES_PER_ROW)

    const creatureStartX =
      creatureRowIndex * CREATURE_GRID_TILE_WIDTH + this.gridStartX
    const creatureStartY =
      creatureColumnIndex * CREATURE_GRID_TILE_HEIGHT + this.gridStartY

    return {
      startPositionX: creatureStartX,
      startPositionY: creatureStartY,
      endPositionX: creatureStartX + CREATURE_GRID_TILE_WIDTH,
      endPositionY: creatureStartY + CREATURE_GRID_TILE_HEIGHT,
      margin: 5
    }
  }
}
