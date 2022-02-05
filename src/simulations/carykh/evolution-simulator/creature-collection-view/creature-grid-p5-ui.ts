import type {AppController} from '../app-controller'
import {P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_OVERDRAW_MARGIN_X,
  CREATURE_GRID_OVERDRAW_MARGIN_Y,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  VIEW_PADDING_START_X,
  VIEW_PADDING_START_Y
} from './constants'
import {
  CreatureGridP5View,
  CreatureGridP5ViewConfig
} from './creature-grid-p5-view'
import {
  PopupSimulationView,
  PopupSimulationViewAnchor
} from './popup-simulation-view'

export interface CreatureGridP5UiConfig {
  appController: AppController
  appStore: AppStore
  p5Wrapper: P5Wrapper
  getCreatureAndGridIndexFn: CreatureGridP5ViewConfig['getCreatureAndGridIndexFn']
  showsPopupSimulation: () => boolean
}

export class CreatureGridP5Ui {
  private appController: AppController
  private appStore: AppStore
  private p5Wrapper: P5Wrapper
  private creatureGridView: CreatureGridP5View
  private popupSimulationView: PopupSimulationView

  private showsPopupSimulation: () => boolean

  constructor(config: CreatureGridP5UiConfig) {
    this.appController = config.appController
    this.appStore = config.appStore
    this.p5Wrapper = config.p5Wrapper

    this.showsPopupSimulation = config.showsPopupSimulation

    const {getCreatureAndGridIndexFn} = config

    this.creatureGridView = new CreatureGridP5View({
      getCreatureAndGridIndexFn,
      p5Wrapper: this.p5Wrapper,
      showsHoverState: this.showsPopupSimulation
    })

    this.popupSimulationView = new PopupSimulationView({
      p5Wrapper: this.p5Wrapper,
      simulationConfig: this.appController.getSimulationConfig()
    })
  }

  draw(): void {
    const {canvas} = this.p5Wrapper
    const {creatureGridView} = this

    canvas.clear()

    const gridStartX = VIEW_PADDING_START_X - CREATURE_GRID_OVERDRAW_MARGIN_X
    const gridStartY = VIEW_PADDING_START_Y - CREATURE_GRID_OVERDRAW_MARGIN_Y

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

  initialize(): void {
    this.creatureGridView.initialize()
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()
  }

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
      creatureRowIndex * CREATURE_GRID_TILE_WIDTH + VIEW_PADDING_START_X
    const creatureStartY =
      creatureColumnIndex * CREATURE_GRID_TILE_HEIGHT + VIEW_PADDING_START_Y

    return {
      startPositionX: creatureStartX,
      startPositionY: creatureStartY,
      endPositionX: creatureStartX + CREATURE_GRID_TILE_WIDTH,
      endPositionY: creatureStartY + CREATURE_GRID_TILE_HEIGHT,
      margin: 5
    }
  }
}
