import type {Graphics, Image} from 'p5'

import {CREATURE_COUNT, SCALE_TO_FIX_BUG} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH
} from '../creature-grid'
import {Creature, creatureIdToIndex} from '../creatures'
import {P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {
  getCachedCreatureImage,
  setCachedCreatureImage
} from './creature-image-cache'

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

    this.creatureDrawer = new CreatureDrawer({p5Wrapper: this.p5Wrapper})

    this.creatureGraphics = this.p5Wrapper.canvas.createGraphics(
      CREATURE_GRID_TILE_WIDTH * 3,
      CREATURE_GRID_TILE_HEIGHT * 3
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
    canvas.scale(scale / SCALE_TO_FIX_BUG)

    const creatureScale = 0.1

    const gridStartX = 40 * creatureScale
    const gridStartY = 42 * creatureScale

    const scaledCreatureWidth = CREATURE_GRID_TILE_WIDTH * creatureScale
    const scaledCreatureHeight = CREATURE_GRID_TILE_HEIGHT * creatureScale

    for (let i2 = 0; i2 < CREATURE_COUNT; i2++) {
      // i2 is the index of where the creature is now
      const creature = appStore.getState().creaturesInLatestGeneration[i2]

      // i1 is the index of where the creature was
      const i1 = creatureIdToIndex(creature.id)

      const x1 = i1 % CREATURE_GRID_TILES_PER_ROW
      const y1 = Math.floor(i1 / CREATURE_GRID_TILES_PER_ROW)
      const x2 = i2 % CREATURE_GRID_TILES_PER_ROW
      const y2 = Math.floor(i2 / CREATURE_GRID_TILES_PER_ROW)
      const x3 = this.interpolate(x1, x2, easedProgress)
      const y3 = this.interpolate(y1, y2, easedProgress)

      const creatureCenterX = x3 * scaledCreatureWidth + scaledCreatureWidth / 2
      const creatureBottomY = y3 * scaledCreatureHeight + scaledCreatureHeight

      const creatureImage = this.getCreatureImage(creature)
      canvas.image(
        creatureImage,
        (creatureCenterX + gridStartX - scaledCreatureWidth * 1.5) *
          SCALE_TO_FIX_BUG,
        (creatureBottomY + gridStartY - scaledCreatureHeight * 2) *
          SCALE_TO_FIX_BUG,
        scaledCreatureWidth * 3 * SCALE_TO_FIX_BUG,
        scaledCreatureHeight * 3 * SCALE_TO_FIX_BUG
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

    // Translate to the bottom center of where the creature is drawn.
    this.creatureGraphics.translate(
      this.creatureGraphics.width / 2,
      (this.creatureGraphics.height * 2) / 3
    )
    // Scale to fit the creature in the center.
    this.creatureGraphics.scale(10 / SCALE_TO_FIX_BUG)

    this.creatureDrawer.drawCreature(creature, 0, 0, this.creatureGraphics)

    this.creatureGraphics.pop()

    image = this.creatureGraphics.get(
      0,
      0,
      this.creatureGraphics.width,
      this.creatureGraphics.height
    )

    setCachedCreatureImage(creature, image)

    return image
  }

  private interpolate(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }
}
