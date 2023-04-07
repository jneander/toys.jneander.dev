import type {Graphics, Image} from 'p5'

import {CREATURE_COUNT} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {Creature, creatureIdToIndex} from '../creatures'
import {P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  VIEW_PADDING_START_X,
  VIEW_PADDING_START_Y,
} from './constants'
import {getCachedCreatureImage, setCachedCreatureImage} from './creature-image-cache'
import {gridIndexToRowAndColumn} from './helpers'

const ANIMATION_DURATION_MS = 5000

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

export interface SortingCreaturesP5ViewConfig {
  appStore: AppStore
  onAnimationFinished: () => void
  p5Wrapper: P5Wrapper
}

export class SortingCreaturesP5View {
  private appStore: AppStore
  private p5Wrapper: P5Wrapper
  private creatureDrawer: CreatureDrawer

  private creatureGraphics: Graphics

  private onAnimationFinished: () => void
  private firstDrawTimestamp: number

  constructor(config: SortingCreaturesP5ViewConfig) {
    this.appStore = config.appStore
    this.p5Wrapper = config.p5Wrapper

    this.creatureDrawer = new CreatureDrawer({
      p5Wrapper: this.p5Wrapper,
    })

    this.creatureGraphics = this.p5Wrapper.canvas.createGraphics(
      CREATURE_GRID_TILE_WIDTH * 3,
      CREATURE_GRID_TILE_HEIGHT * 3,
    )

    this.onAnimationFinished = config.onAnimationFinished
    this.firstDrawTimestamp = 0
  }

  draw(): void {
    const {appStore, p5Wrapper} = this
    const {canvas} = p5Wrapper

    let elapsedTimeMs = 0
    if (this.firstDrawTimestamp === 0) {
      this.firstDrawTimestamp = Date.now()
    } else {
      elapsedTimeMs = Date.now() - this.firstDrawTimestamp
    }

    const animationProgress = elapsedTimeMs / ANIMATION_DURATION_MS
    const easedProgress = easeInOutQuad(animationProgress)

    const scale = 10

    canvas.clear()
    canvas.push()
    canvas.scale(scale)

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

      const {columnIndex: startColumnIndex, rowIndex: startRowIndex} =
        gridIndexToRowAndColumn(startGridIndex)
      const {columnIndex: endColumnIndex, rowIndex: endRowIndex} =
        gridIndexToRowAndColumn(endGridIndex)

      const columnIndex = this.interpolate(startColumnIndex, endColumnIndex, easedProgress)
      const rowIndex = this.interpolate(startRowIndex, endRowIndex, easedProgress)

      const tileStartX = gridStartX + columnIndex * tileWidth
      const tileStartY = gridStartY + rowIndex * tileHeight

      const creatureImage = this.getCreatureImage(creature)

      canvas.image(
        creatureImage,
        tileStartX - creatureImageOverdrawMarginX,
        tileStartY - creatureImageOverdrawMarginY,
        tileWidth * 3,
        tileHeight * 3,
      )
    }

    canvas.pop()

    if (animationProgress >= 1) {
      this.onAnimationFinished()
    }
  }

  private getCreatureImage(creature: Creature): Image {
    let image = getCachedCreatureImage(creature)

    if (image != null) {
      return image
    }

    this.creatureGraphics.clear()

    this.creatureGraphics.push()

    // Translate to the center of where the creature is drawn.
    this.creatureGraphics.translate(
      this.creatureGraphics.width / 2,
      this.creatureGraphics.height / 2,
    )
    // Scale to fit the creature in the center.
    this.creatureGraphics.scale(10)

    this.creatureDrawer.drawCreature(creature, 0, 0, this.creatureGraphics)

    this.creatureGraphics.pop()

    image = this.creatureGraphics.get(
      0,
      0,
      this.creatureGraphics.width,
      this.creatureGraphics.height,
    )

    setCachedCreatureImage(creature, image)

    return image
  }

  private interpolate(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }
}
