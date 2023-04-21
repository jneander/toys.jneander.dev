import type {AppController} from '../app-controller'
import {CREATURE_COUNT} from '../constants'
import type {P5CanvasContainer, P5ViewAdapter, P5ViewDimensions, P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  VIEW_PADDING_END_X,
  VIEW_PADDING_END_Y,
  VIEW_PADDING_START_X,
  VIEW_PADDING_START_Y,
} from './constants'
import {CreatureGridP5View} from './creature-grid-p5-view'
import {gridIndexToRowAndColumn} from './helpers'
import {PopupSimulationView, PopupSimulationViewAnchor} from './popup-simulation-view'
import type {CreatureAndGridIndex} from './types'

export interface CreatureGridAdapterConfig {
  appController: AppController
  appStore: AppStore
  getCreatureAndGridIndexFn: (index: number) => CreatureAndGridIndex
  showsPopupSimulation: () => boolean
}

export class CreatureGridAdapter implements P5ViewAdapter {
  private config: CreatureGridAdapterConfig

  private creatureGridView?: CreatureGridP5View
  private p5Wrapper?: P5Wrapper
  private popupSimulationView?: PopupSimulationView

  constructor(config: CreatureGridAdapterConfig) {
    this.config = config
  }

  initialize(p5Wrapper: P5Wrapper, container: P5CanvasContainer): void {
    this.p5Wrapper = p5Wrapper

    const {height, width} = this.getDimensions(container)
    p5Wrapper.updateCanvasSize(width, height)

    this.creatureGridView = new CreatureGridP5View({
      dimensions: {height, width},
      getCreatureAndGridIndexFn: this.config.getCreatureAndGridIndexFn,
      p5Wrapper,
      showsHoverState: this.config.showsPopupSimulation,
    })

    this.popupSimulationView = new PopupSimulationView({
      p5Wrapper,
      simulationConfig: this.config.appController.getSimulationConfig(),
    })

    this.creatureGridView.initialize()
  }

  deinitialize(): void {
    delete this.creatureGridView
    delete this.popupSimulationView
    delete this.p5Wrapper
  }

  draw(): void {
    const {creatureGridView, p5Wrapper, popupSimulationView} = this

    if (!(creatureGridView && p5Wrapper && popupSimulationView)) {
      return
    }

    const {p5} = p5Wrapper

    p5.clear(0, 0, 0, 0)

    creatureGridView.draw()
    p5.image(creatureGridView.graphics, 0, 0)

    if (!this.config.showsPopupSimulation()) {
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
      popupSimulationView.setAnchor(anchor)

      popupSimulationView.draw()
    } else {
      this.clearPopupSimulation()
    }
  }

  onMouseReleased() {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView?.dismissSimulationView()
  }

  onContainerWidthChanged(containerWidth: number): void {
    const {height, width} = this.getDimensionsFromWidth(containerWidth)
    this.p5Wrapper?.updateCanvasSize(width, height)
    this.creatureGridView?.setDimensions(width, height)
  }

  private setPopupSimulationCreatureInfo(generationCreatureIndex: number): void {
    const creature =
      this.config.appStore.getState().creaturesInLatestGeneration[generationCreatureIndex]

    this.popupSimulationView?.setCreatureInfo({
      creature,
      rank: generationCreatureIndex + 1,
    })
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView?.setCreatureInfo(null)
  }

  private calculateAnchorForPopupSimulation(gridIndex: number): PopupSimulationViewAnchor {
    const {columnIndex, rowIndex} = gridIndexToRowAndColumn(gridIndex, this.getMaxTilesPerRow())

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

  private getDimensions(container: P5CanvasContainer): P5ViewDimensions {
    return this.getDimensionsFromWidth(container.getAvailableWidth())
  }

  private getDimensionsFromWidth(width: number): P5ViewDimensions {
    const tilesPerRow = this.getMaxTilesPerRow(width)

    const maxRows = Math.ceil(CREATURE_COUNT / tilesPerRow)
    const gridAreaHeight = maxRows * CREATURE_GRID_TILE_HEIGHT
    const height = gridAreaHeight + VIEW_PADDING_START_Y + VIEW_PADDING_END_Y

    return {
      height,
      width: tilesPerRow * CREATURE_GRID_TILE_WIDTH + VIEW_PADDING_START_X + VIEW_PADDING_END_X,
    }
  }

  private getMaxTilesPerRow(canvasWidth?: number): number {
    const width = canvasWidth || this.p5Wrapper?.width

    if (width == null) {
      throw new Error('CreatureGridAdapter is not initialized')
    }

    const gridAreaWidth = width - VIEW_PADDING_START_X - VIEW_PADDING_END_X
    return Math.floor(gridAreaWidth / CREATURE_GRID_TILE_WIDTH)
  }
}
