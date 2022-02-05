import type {Graphics, Image} from 'p5'

import {CREATURE_COUNT} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import type {Creature} from '../creatures'
import type {P5Wrapper} from '../p5-utils'
import {
  CREATURE_GRID_TILES_PER_COLUMN,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH
} from './constants'
import {
  getCachedCreatureImage,
  setCachedCreatureImage
} from './creature-image-cache'

export interface CreatureGridP5ViewConfig {
  getCreatureAndGridIndexFn: (index: number) => {
    creature: Creature
    gridIndex: number
  }

  gridStartX: number
  gridStartY: number
  p5Wrapper: P5Wrapper
  showsHoverState: () => boolean
}

export class CreatureGridP5View {
  public graphics: Graphics

  private config: CreatureGridP5ViewConfig
  private creatureDrawer: CreatureDrawer

  private creatureGraphics: Graphics
  private gridGraphics: Graphics
  private hoverGraphics: Graphics

  constructor(config: CreatureGridP5ViewConfig) {
    this.config = config

    this.creatureDrawer = new CreatureDrawer({
      p5Wrapper: config.p5Wrapper
    })

    const width = (CREATURE_GRID_TILES_PER_ROW + 1) * CREATURE_GRID_TILE_WIDTH
    const height =
      (CREATURE_GRID_TILES_PER_COLUMN + 1) * CREATURE_GRID_TILE_HEIGHT

    const {canvas} = config.p5Wrapper

    this.creatureGraphics = canvas.createGraphics(
      CREATURE_GRID_TILE_WIDTH * 3,
      CREATURE_GRID_TILE_HEIGHT * 3
    )
    this.gridGraphics = canvas.createGraphics(width, height)
    this.hoverGraphics = canvas.createGraphics(width, height)
    this.graphics = canvas.createGraphics(width, height)
  }

  initialize(): void {
    this.drawCreatureGrid()
    this.graphics.image(this.gridGraphics, 0, 0)
  }

  draw(): void {
    if (this.config.showsHoverState()) {
      this.drawCreatureHoverState()
    }

    const {gridGraphics, hoverGraphics, graphics} = this

    graphics.clear()

    graphics.image(gridGraphics, 0, 0)
    graphics.image(hoverGraphics, 0, 0)
  }

  getGridIndexUnderCursor(): number | null {
    const {gridStartX, gridStartY, p5Wrapper} = this.config

    const gridWidth = 1200
    const gridHeight = 625

    if (
      p5Wrapper.rectIsUnderCursor(
        gridStartX,
        gridStartY,
        gridWidth - 1,
        gridHeight - 1
      )
    ) {
      const {cursorX, cursorY} = p5Wrapper.getCursorPosition()

      return (
        Math.floor((cursorX - gridStartX) / CREATURE_GRID_TILE_WIDTH) +
        Math.floor((cursorY - gridStartY) / CREATURE_GRID_TILE_HEIGHT) *
          CREATURE_GRID_TILES_PER_ROW
      )
    }

    return null
  }

  private drawCreatureGrid(): void {
    const {getCreatureAndGridIndexFn} = this.config
    const {gridGraphics} = this

    const scale = 10

    gridGraphics.clear()
    gridGraphics.push()
    gridGraphics.scale(scale)

    const creatureScale = 0.1

    const scaledCreatureWidth = CREATURE_GRID_TILE_WIDTH * creatureScale
    const scaledCreatureHeight = CREATURE_GRID_TILE_HEIGHT * creatureScale

    const marginX = scaledCreatureWidth
    const marginY = scaledCreatureHeight / 2 + scaledCreatureHeight

    const blankMarginX = scaledCreatureWidth / 2
    const blankMarginY = scaledCreatureHeight / 2

    const blankWidth = scaledCreatureWidth
    const blankHeight = scaledCreatureHeight

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const {creature, gridIndex} = getCreatureAndGridIndexFn(i)

      const gridX = gridIndex % CREATURE_GRID_TILES_PER_ROW
      const gridY = Math.floor(gridIndex / CREATURE_GRID_TILES_PER_ROW)

      if (creature.alive) {
        const creatureCenterX = gridX * scaledCreatureWidth + marginX
        const creatureBottomY = gridY * scaledCreatureHeight + marginY

        const creatureImage = this.getCreatureImage(creature)
        gridGraphics.image(
          creatureImage,
          creatureCenterX - scaledCreatureWidth * 1.5,
          creatureBottomY - scaledCreatureHeight * 2,
          scaledCreatureWidth * 3,
          scaledCreatureHeight * 3
        )
      } else {
        const blankLeftX = gridX * scaledCreatureWidth + blankMarginX
        const blankTopY = gridY * scaledCreatureHeight + blankMarginY

        gridGraphics.fill(0)
        gridGraphics.noStroke()
        gridGraphics.rect(blankLeftX, blankTopY, blankWidth, blankHeight)
      }
    }

    gridGraphics.pop()
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
    this.creatureGraphics.scale(10)

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

  private drawCreatureHoverState(): void {
    const {config, hoverGraphics} = this
    const {canvas} = config.p5Wrapper

    hoverGraphics.clear()

    const gridIndex = this.getGridIndexUnderCursor()

    if (gridIndex != null) {
      hoverGraphics.push()

      hoverGraphics.stroke(Math.abs((canvas.frameCount % 30) - 15) * 17) // oscillate between 0–255
      hoverGraphics.strokeWeight(3)
      hoverGraphics.noFill()

      const x = gridIndex % CREATURE_GRID_TILES_PER_ROW
      const y = Math.floor(gridIndex / CREATURE_GRID_TILES_PER_ROW)

      hoverGraphics.rect(
        x * CREATURE_GRID_TILE_WIDTH + CREATURE_GRID_TILE_WIDTH / 2,
        y * CREATURE_GRID_TILE_HEIGHT +
          Math.floor(CREATURE_GRID_TILE_HEIGHT / 2),
        CREATURE_GRID_TILE_WIDTH,
        CREATURE_GRID_TILE_HEIGHT
      )

      hoverGraphics.pop()
    }
  }
}
