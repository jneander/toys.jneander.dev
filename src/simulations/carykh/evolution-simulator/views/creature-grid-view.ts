import type {Graphics} from 'p5'

import type Creature from '../Creature'
import {CREATURE_COUNT, SCALE_TO_FIX_BUG} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import type {AppView} from './app-view'

export interface CreatureGridViewConfig {
  appView: AppView

  getCreatureAndGridIndexFn: (index: number) => {
    creature: Creature
    gridIndex: number
  }

  gridStartX: number
  gridStartY: number
}

const creatureTileWidth = 30
const creatureTileHeight = 25
const creaturesPerRow = 40
const creaturesPerColumn = CREATURE_COUNT / creaturesPerRow

export class CreatureGridView {
  private config: CreatureGridViewConfig
  private creatureDrawer: CreatureDrawer

  graphics: Graphics
  private creatureGraphics: Graphics
  private hoverGraphics: Graphics

  constructor(config: CreatureGridViewConfig) {
    this.config = config

    this.creatureDrawer = new CreatureDrawer({appView: config.appView})

    const width = (creaturesPerRow + 1) * creatureTileWidth
    const height = (creaturesPerColumn + 1) * creatureTileHeight

    this.creatureGraphics = config.appView.canvas.createGraphics(width, height)
    this.hoverGraphics = config.appView.canvas.createGraphics(width, height)
    this.graphics = config.appView.canvas.createGraphics(width, height)
  }

  initialize(): void {
    this.drawCreatureGrid()
    this.graphics.image(this.creatureGraphics, 0, 0)
  }

  deinitialize(): void {
    this.creatureGraphics.remove()
    this.hoverGraphics.remove()
    this.graphics.remove()
  }

  draw(): void {
    this.drawCreatureHoverState()

    const {creatureGraphics, hoverGraphics, graphics} = this

    graphics.clear()

    graphics.image(creatureGraphics, 0, 0)
    graphics.image(hoverGraphics, 0, 0)
  }

  getGridIndexUnderCursor(): number | null {
    const {appView, gridStartX, gridStartY} = this.config

    const creaturesPerRow = 40

    const gridWidth = 1200
    const gridHeight = 625

    const creatureTileWidth = 30
    const creatureTileHeight = 25

    if (
      appView.rectIsUnderCursor(
        gridStartX,
        gridStartY,
        gridWidth - 1,
        gridHeight - 1
      )
    ) {
      const {cursorX, cursorY} = appView.getCursorPosition()

      return (
        Math.floor((cursorX - gridStartX) / creatureTileWidth) +
        Math.floor((cursorY - gridStartY) / creatureTileHeight) *
          creaturesPerRow
      )
    }

    return null
  }

  private drawCreatureGrid(): void {
    const {getCreatureAndGridIndexFn} = this.config
    const {creatureGraphics} = this

    const scale = 10
    const creatureWidth = 30
    const creatureHeight = 25
    const creaturesPerRow = 40

    creatureGraphics.clear()
    creatureGraphics.push()
    creatureGraphics.scale(scale / SCALE_TO_FIX_BUG)

    const creatureScale = 0.1

    const scaledCreatureWidth = creatureWidth * creatureScale
    const scaledCreatureHeight = creatureHeight * creatureScale

    const marginX = scaledCreatureWidth
    const marginY = scaledCreatureHeight / 2 + scaledCreatureHeight

    const blankMarginX = scaledCreatureWidth / 2
    const blankMarginY = scaledCreatureHeight / 2

    const blankWidth = scaledCreatureWidth * SCALE_TO_FIX_BUG
    const blankHeight = scaledCreatureHeight * SCALE_TO_FIX_BUG

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const {creature, gridIndex} = getCreatureAndGridIndexFn(i)

      const gridX = gridIndex % creaturesPerRow
      const gridY = Math.floor(gridIndex / creaturesPerRow)

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
    const {canvas} = config.appView

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
        x * creatureTileWidth + creatureTileWidth / 2,
        y * creatureTileHeight + Math.floor(creatureTileHeight / 2),
        creatureTileWidth,
        creatureTileHeight
      )

      hoverGraphics.pop()
    }
  }
}