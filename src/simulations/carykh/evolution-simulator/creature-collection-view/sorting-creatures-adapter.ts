import type {Graphics, Image} from 'p5'

import {CREATURE_COUNT} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {Creature, creatureIdToIndex} from '../creatures'
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
import {getCachedCreatureImage, setCachedCreatureImage} from './creature-image-cache'
import {gridIndexToRowAndColumn} from './helpers'

const ANIMATION_DURATION_MS = 5000

export interface SortingCreaturesAdapterConfig {
  appStore: AppStore
  onAnimationFinished: () => void
}

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

function interpolate(a: number, b: number, offset: number): number {
  return a + (b - a) * offset
}

export class SortingCreaturesAdapter implements P5ViewAdapter {
  private config: SortingCreaturesAdapterConfig

  private creatureDrawer?: CreatureDrawer
  private creatureGraphics?: Graphics
  private p5Wrapper?: P5Wrapper

  private firstDrawTimestamp: number

  constructor(config: SortingCreaturesAdapterConfig) {
    this.config = config

    this.firstDrawTimestamp = 0
  }

  initialize(p5Wrapper: P5Wrapper, container: P5CanvasContainer): void {
    this.p5Wrapper = p5Wrapper

    const {height, width} = this.getDimensions(container)
    p5Wrapper.updateCanvasSize(width, height)

    this.creatureDrawer = new CreatureDrawer({
      p5Wrapper: this.p5Wrapper,
    })

    this.creatureGraphics = this.p5Wrapper.p5.createGraphics(
      CREATURE_GRID_TILE_WIDTH * 3,
      CREATURE_GRID_TILE_HEIGHT * 3,
    )

    this.firstDrawTimestamp = 0
  }

  deinitialize(): void {
    delete this.creatureDrawer
    delete this.creatureGraphics
    delete this.p5Wrapper
  }

  draw(): void {
    const {creatureDrawer, p5Wrapper} = this

    if (!(creatureDrawer && p5Wrapper)) {
      return
    }

    const {appStore} = this.config

    const {p5} = p5Wrapper

    let elapsedTimeMs = 0
    if (this.firstDrawTimestamp === 0) {
      this.firstDrawTimestamp = Date.now()
    } else {
      elapsedTimeMs = Date.now() - this.firstDrawTimestamp
    }

    const animationProgress = elapsedTimeMs / ANIMATION_DURATION_MS
    const easedProgress = easeInOutQuad(animationProgress)

    const scale = 10

    p5.clear(0, 0, 0, 0)
    p5.push()
    p5.scale(scale)

    const gridAreaScale = 0.1

    const gridStartX = VIEW_PADDING_START_X * gridAreaScale
    const gridStartY = VIEW_PADDING_START_Y * gridAreaScale

    const tileWidth = CREATURE_GRID_TILE_WIDTH * gridAreaScale
    const tileHeight = CREATURE_GRID_TILE_HEIGHT * gridAreaScale

    const creatureImageOverdrawMarginX = tileWidth
    const creatureImageOverdrawMarginY = tileHeight

    for (let endGridIndex = 0; endGridIndex < CREATURE_COUNT; endGridIndex++) {
      // gridIndex2 is the index of where the creature is now
      const creature = appStore.getState().creaturesInLatestGeneration[endGridIndex]

      // gridIndex1 is the index of where the creature was
      const startGridIndex = creatureIdToIndex(creature.id)
      const tilesPerRow = this.getMaxTilesPerRow()

      const {columnIndex: startColumnIndex, rowIndex: startRowIndex} = gridIndexToRowAndColumn(
        startGridIndex,
        tilesPerRow,
      )
      const {columnIndex: endColumnIndex, rowIndex: endRowIndex} = gridIndexToRowAndColumn(
        endGridIndex,
        tilesPerRow,
      )

      const columnIndex = interpolate(startColumnIndex, endColumnIndex, easedProgress)
      const rowIndex = interpolate(startRowIndex, endRowIndex, easedProgress)

      const tileStartX = gridStartX + columnIndex * tileWidth
      const tileStartY = gridStartY + rowIndex * tileHeight

      const creatureImage = this.getCreatureImage(creature)

      p5.image(
        creatureImage,
        tileStartX - creatureImageOverdrawMarginX,
        tileStartY - creatureImageOverdrawMarginY,
        tileWidth * 3,
        tileHeight * 3,
      )
    }

    p5.pop()

    if (animationProgress >= 1) {
      this.config.onAnimationFinished()
    }
  }

  private getCreatureImage(creature: Creature): Image {
    let image = getCachedCreatureImage(creature)

    if (image != null) {
      return image
    }

    const {creatureDrawer, creatureGraphics} = this

    if (!(creatureDrawer && creatureGraphics)) {
      throw new Error('SortingCreaturesAdapter has not been initialized')
    }

    creatureGraphics.clear(0, 0, 0, 0)

    creatureGraphics.push()

    // Translate to the center of where the creature is drawn.
    creatureGraphics.translate(creatureGraphics.width / 2, creatureGraphics.height / 2)
    // Scale to fit the creature in the center.
    creatureGraphics.scale(10)

    creatureDrawer.drawCreature(creature, 0, 0, creatureGraphics)

    creatureGraphics.pop()

    image = creatureGraphics.get(0, 0, creatureGraphics.width, creatureGraphics.height)

    setCachedCreatureImage(creature, image)

    return image
  }

  private getDimensions(container: P5CanvasContainer): P5ViewDimensions {
    const width = container.getAvailableWidth()

    const tilesPerRow = this.getMaxTilesPerRow(width)

    const maxRows = Math.ceil(CREATURE_COUNT / tilesPerRow)
    const gridAreaHeight = maxRows * CREATURE_GRID_TILE_HEIGHT
    const height = gridAreaHeight + VIEW_PADDING_START_Y + VIEW_PADDING_END_Y

    return {
      height,
      width,
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
