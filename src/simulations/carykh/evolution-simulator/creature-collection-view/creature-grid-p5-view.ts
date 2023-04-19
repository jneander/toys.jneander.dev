import type {Graphics, Image} from 'p5'

import {CREATURE_COUNT} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import type {Creature} from '../creatures'
import type {P5ViewDimensions, P5Wrapper} from '../p5-utils'
import {
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  VIEW_PADDING_END_X,
  VIEW_PADDING_START_X,
  VIEW_PADDING_START_Y,
} from './constants'
import {getCachedCreatureImage, setCachedCreatureImage} from './creature-image-cache'
import {gridIndexToRowAndColumn, rowAndColumnToGridIndex} from './helpers'

export interface CreatureGridP5ViewConfig {
  dimensions: P5ViewDimensions

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

  private width: number

  constructor(config: CreatureGridP5ViewConfig) {
    this.config = config

    this.creatureDrawer = new CreatureDrawer({
      p5Wrapper: config.p5Wrapper,
      showLabels: false,
    })

    const {height, width} = config.dimensions

    this.width = width

    const {p5} = config.p5Wrapper

    this.creatureGraphics = p5.createGraphics(
      CREATURE_GRID_TILE_WIDTH * 3,
      CREATURE_GRID_TILE_HEIGHT * 3,
    )
    this.gridGraphics = p5.createGraphics(width, height)
    this.hoverGraphics = p5.createGraphics(width, height)
    this.graphics = p5.createGraphics(width, height)
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

    graphics.clear(0, 0, 0, 0)

    graphics.image(gridGraphics, 0, 0)
    graphics.image(hoverGraphics, 0, 0)
  }

  getGridIndexUnderCursor(): number | null {
    const {p5Wrapper} = this.config

    const tilesPerRow = this.getMaxCreatureTilesPerRow()
    const gridAreaWidth = tilesPerRow * CREATURE_GRID_TILE_WIDTH
    const tilesPerColumn = Math.ceil(CREATURE_COUNT / tilesPerRow)
    const gridAreaHeight = tilesPerColumn * CREATURE_GRID_TILE_HEIGHT

    if (
      p5Wrapper.rectIsUnderCursor(
        VIEW_PADDING_START_X,
        VIEW_PADDING_START_Y,
        // Subtract the trailing pixel from each dimension.
        gridAreaWidth - 1,
        gridAreaHeight - 1,
      )
    ) {
      const {cursorX, cursorY} = p5Wrapper.getCursorPosition()

      const gridCursorX = cursorX - VIEW_PADDING_START_X
      const gridCursorY = cursorY - VIEW_PADDING_START_Y

      return rowAndColumnToGridIndex(
        {
          columnIndex: Math.floor(gridCursorX / CREATURE_GRID_TILE_WIDTH),
          rowIndex: Math.floor(gridCursorY / CREATURE_GRID_TILE_HEIGHT),
        },
        this.getMaxCreatureTilesPerRow(),
      )
    }

    return null
  }

  setDimensions(width: number, height: number): void {
    this.width = width

    this.graphics.resizeCanvas(width, height)
    this.gridGraphics.resizeCanvas(width, height)
    this.hoverGraphics.resizeCanvas(width, height)

    this.drawCreatureGrid()
  }

  private drawCreatureGrid(): void {
    const {getCreatureAndGridIndexFn} = this.config
    const {gridGraphics} = this

    const scale = 10

    gridGraphics.clear(0, 0, 0, 0)
    gridGraphics.push()
    gridGraphics.scale(scale)

    const gridAreaScale = 0.1

    const gridStartX = VIEW_PADDING_START_X * gridAreaScale
    const gridStartY = VIEW_PADDING_START_Y * gridAreaScale

    const tileWidth = CREATURE_GRID_TILE_WIDTH * gridAreaScale
    const tileHeight = CREATURE_GRID_TILE_HEIGHT * gridAreaScale

    const creatureImageOverdrawMarginX = tileWidth
    const creatureImageOverdrawMarginY = tileHeight

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const {creature, gridIndex} = getCreatureAndGridIndexFn(i)
      const {columnIndex, rowIndex} = gridIndexToRowAndColumn(
        gridIndex,
        this.getMaxCreatureTilesPerRow(),
      )

      const tileStartX = gridStartX + columnIndex * tileWidth
      const tileStartY = gridStartY + rowIndex * tileHeight

      if (creature.alive) {
        const creatureImage = this.getCreatureImage(creature)

        gridGraphics.image(
          creatureImage,
          tileStartX - creatureImageOverdrawMarginX,
          tileStartY - creatureImageOverdrawMarginY,
          tileWidth * 3,
          tileHeight * 3,
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

    this.creatureGraphics.clear(0, 0, 0, 0)

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

  private drawCreatureHoverState(): void {
    const {config, hoverGraphics} = this
    const {p5} = config.p5Wrapper

    hoverGraphics.clear(0, 0, 0, 0)

    const gridIndex = this.getGridIndexUnderCursor()

    if (gridIndex != null) {
      hoverGraphics.push()

      hoverGraphics.stroke(Math.abs((p5.frameCount % 30) - 15) * 17) // oscillate between 0–255
      hoverGraphics.strokeWeight(2)
      hoverGraphics.noFill()

      const {columnIndex, rowIndex} = gridIndexToRowAndColumn(
        gridIndex,
        this.getMaxCreatureTilesPerRow(),
      )

      const tileStartX = VIEW_PADDING_START_X + columnIndex * CREATURE_GRID_TILE_WIDTH
      const tileStartY = VIEW_PADDING_START_Y + rowIndex * CREATURE_GRID_TILE_HEIGHT

      hoverGraphics.rect(
        tileStartX,
        tileStartY,
        CREATURE_GRID_TILE_WIDTH,
        CREATURE_GRID_TILE_HEIGHT,
      )

      hoverGraphics.pop()
    }
  }

  private getMaxCreatureTilesPerRow(): number {
    const gridAreaWidth = this.width - VIEW_PADDING_START_X - VIEW_PADDING_END_X
    return Math.floor(gridAreaWidth / CREATURE_GRID_TILE_WIDTH)
  }
}
