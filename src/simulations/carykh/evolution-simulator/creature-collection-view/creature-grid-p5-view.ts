import type {Graphics} from 'p5'

import {CREATURE_COUNT, SCALE_TO_FIX_BUG} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import type {Creature} from '../creatures'
import type {P5Wrapper} from '../p5-utils'
import {
  CREATURE_GRID_TILES_PER_COLUMN,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH
} from './constants'

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
  private config: CreatureGridP5ViewConfig
  private creatureDrawer: CreatureDrawer

  graphics: Graphics
  private creatureGraphics: Graphics
  private hoverGraphics: Graphics

  constructor(config: CreatureGridP5ViewConfig) {
    this.config = config

    this.creatureDrawer = new CreatureDrawer({p5Wrapper: config.p5Wrapper})

    const width = (CREATURE_GRID_TILES_PER_ROW + 1) * CREATURE_GRID_TILE_WIDTH
    const height =
      (CREATURE_GRID_TILES_PER_COLUMN + 1) * CREATURE_GRID_TILE_HEIGHT

    this.creatureGraphics = config.p5Wrapper.canvas.createGraphics(
      width,
      height
    )
    this.hoverGraphics = config.p5Wrapper.canvas.createGraphics(width, height)
    this.graphics = config.p5Wrapper.canvas.createGraphics(width, height)
  }

  initialize(): void {
    this.drawCreatureGrid()
    this.graphics.image(this.creatureGraphics, 0, 0)
  }

  draw(): void {
    if (this.config.showsHoverState()) {
      this.drawCreatureHoverState()
    }

    const {creatureGraphics, hoverGraphics, graphics} = this

    graphics.clear()

    graphics.image(creatureGraphics, 0, 0)
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
    const {creatureGraphics} = this

    const scale = 10

    creatureGraphics.clear()
    creatureGraphics.push()
    creatureGraphics.scale(scale / SCALE_TO_FIX_BUG)

    const creatureScale = 0.1

    const scaledCreatureWidth = CREATURE_GRID_TILE_WIDTH * creatureScale
    const scaledCreatureHeight = CREATURE_GRID_TILE_HEIGHT * creatureScale

    const marginX = scaledCreatureWidth
    const marginY = scaledCreatureHeight / 2 + scaledCreatureHeight

    const blankMarginX = scaledCreatureWidth / 2
    const blankMarginY = scaledCreatureHeight / 2

    const blankWidth = scaledCreatureWidth * SCALE_TO_FIX_BUG
    const blankHeight = scaledCreatureHeight * SCALE_TO_FIX_BUG

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const {creature, gridIndex} = getCreatureAndGridIndexFn(i)

      const gridX = gridIndex % CREATURE_GRID_TILES_PER_ROW
      const gridY = Math.floor(gridIndex / CREATURE_GRID_TILES_PER_ROW)

      if (creature.alive) {
        const creatureCenterX = gridX * scaledCreatureWidth + marginX
        const creatureBottomY = gridY * scaledCreatureHeight + marginY

        this.creatureDrawer.drawCreature(
          creature,
          creatureCenterX,
          creatureBottomY,
          creatureGraphics
        )
      } else {
        const blankLeftX =
          (gridX * scaledCreatureWidth + blankMarginX) * SCALE_TO_FIX_BUG
        const blankTopY =
          (gridY * scaledCreatureHeight + blankMarginY) * SCALE_TO_FIX_BUG

        creatureGraphics.fill(0)
        creatureGraphics.rect(blankLeftX, blankTopY, blankWidth, blankHeight)
      }
    }

    creatureGraphics.pop()
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

      const x = gridIndex % 40
      const y = Math.floor(gridIndex / 40)

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
