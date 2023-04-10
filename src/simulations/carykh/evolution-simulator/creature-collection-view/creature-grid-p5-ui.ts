import type {AppController} from '../app-controller'
import {P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  VIEW_PADDING_START_X,
  VIEW_PADDING_START_Y,
} from './constants'
import {CreatureGridP5View, CreatureGridP5ViewConfig} from './creature-grid-p5-view'
import {gridIndexToRowAndColumn} from './helpers'
import {PopupSimulationView, PopupSimulationViewAnchor} from './popup-simulation-view'

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
      showsHoverState: this.showsPopupSimulation,
    })

    this.popupSimulationView = new PopupSimulationView({
      p5Wrapper: this.p5Wrapper,
      simulationConfig: this.appController.getSimulationConfig(),
    })
  }

  draw(): void {
    const {canvas} = this.p5Wrapper
    const {creatureGridView} = this

    canvas.clear(0, 0, 0, 0)

    creatureGridView.draw()
    canvas.image(creatureGridView.graphics, 0, 0)

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

  private setPopupSimulationCreatureInfo(generationCreatureIndex: number): void {
    const creature = this.appStore.getState().creaturesInLatestGeneration[generationCreatureIndex]

    this.popupSimulationView.setCreatureInfo({
      creature,
      rank: generationCreatureIndex + 1,
    })
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView.setCreatureInfo(null)
  }

  private calculateAnchorForPopupSimulation(gridIndex: number): PopupSimulationViewAnchor {
    const {columnIndex, rowIndex} = gridIndexToRowAndColumn(gridIndex)

    const tileStartX = VIEW_PADDING_START_X + columnIndex * CREATURE_GRID_TILE_WIDTH
    const tileStartY = VIEW_PADDING_START_Y + rowIndex * CREATURE_GRID_TILE_HEIGHT

    return {
      startPositionX: tileStartX,
      startPositionY: tileStartY,
      endPositionX: tileStartX + CREATURE_GRID_TILE_WIDTH,
      endPositionY: tileStartY + CREATURE_GRID_TILE_HEIGHT,
      margin: 5,
    }
  }
}
