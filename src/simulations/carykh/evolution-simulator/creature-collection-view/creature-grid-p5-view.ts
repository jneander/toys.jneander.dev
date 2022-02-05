import type {Graphics, Image} from 'p5'

import {CREATURE_COUNT} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import type {Creature} from '../creatures'
import type {P5Wrapper} from '../p5-utils'
import {
  CREATURE_GRID_OVERDRAW_MARGIN_X,
  CREATURE_GRID_OVERDRAW_MARGIN_Y,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  GRID_AREA_HEIGHT,
  GRID_AREA_WIDTH,
  VIEW_PADDING_START_X,
  VIEW_PADDING_START_Y
} from './constants'
import {
  getCachedCreatureImage,
  setCachedCreatureImage
} from './creature-image-cache'
import {gridIndexToRowAndColumn} from './helpers'

export interface CreatureGridP5ViewConfig {
  getCreatureAndGridIndexFn: (index: number) => {
    creature: Creature
    gridIndex: number
  }

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

    const width = GRID_AREA_WIDTH + CREATURE_GRID_OVERDRAW_MARGIN_X * 2
    const height = GRID_AREA_HEIGHT + CREATURE_GRID_OVERDRAW_MARGIN_Y * 2

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
    const {p5Wrapper} = this.config

    if (
      p5Wrapper.rectIsUnderCursor(
        VIEW_PADDING_START_X,
        VIEW_PADDING_START_Y,
        // Subtract the trailing pixel from each dimension.
        GRID_AREA_WIDTH - 1,
        GRID_AREA_HEIGHT - 1
      )
    ) {
      const {cursorX, cursorY} = p5Wrapper.getCursorPosition()

      return (
        Math.floor(
          (cursorX - VIEW_PADDING_START_X) / CREATURE_GRID_TILE_WIDTH
        ) +
        Math.floor(
          (cursorY - VIEW_PADDING_START_Y) / CREATURE_GRID_TILE_HEIGHT
        ) *
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

    const gridAreaScale = 0.1

    const tileWidth = CREATURE_GRID_TILE_WIDTH * gridAreaScale
    const tileHeight = CREATURE_GRID_TILE_HEIGHT * gridAreaScale

    const gridAreaOverdrawMarginX = tileWidth / 2
    const gridAreaOverdrawMarginY = tileHeight / 2

    const creatureImageOverdrawMarginX = tileWidth
    const creatureImageOverdrawMarginY = tileHeight

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const {creature, gridIndex} = getCreatureAndGridIndexFn(i)
      const {columnIndex, rowIndex} = gridIndexToRowAndColumn(gridIndex)

      const tileStartX = gridAreaOverdrawMarginX + columnIndex * tileWidth
      const tileStartY = gridAreaOverdrawMarginY + rowIndex * tileHeight

      if (creature.alive) {
        const creatureImage = this.getCreatureImage(creature)

        gridGraphics.image(
          creatureImage,
          tileStartX - creatureImageOverdrawMarginX,
          tileStartY - creatureImageOverdrawMarginY,
          tileWidth * 3,
          tileHeight * 3
        )
      } else {
        gridGraphics.fill(0)
        gridGraphics.noStroke()
        gridGraphics.rect(tileStartX, tileStartY, tileWidth, tileHeight)
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

      const {columnIndex, rowIndex} = gridIndexToRowAndColumn(gridIndex)

      const gridAreaOverdrawMarginX = Math.floor(CREATURE_GRID_TILE_WIDTH / 2)
      const gridAreaOverdrawMarginY = Math.floor(CREATURE_GRID_TILE_HEIGHT / 2)

      hoverGraphics.rect(
        columnIndex * CREATURE_GRID_TILE_WIDTH + gridAreaOverdrawMarginX,
        rowIndex * CREATURE_GRID_TILE_HEIGHT + gridAreaOverdrawMarginY,
        CREATURE_GRID_TILE_WIDTH,
        CREATURE_GRID_TILE_HEIGHT
      )

      hoverGraphics.pop()
    }
  }
}
