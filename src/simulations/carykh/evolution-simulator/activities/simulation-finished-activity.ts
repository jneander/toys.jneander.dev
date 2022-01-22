import type {Graphics} from 'p5'

import {ActivityId} from '../constants'
import {creatureIdToIndex} from '../helpers'
import {
  ButtonWidget,
  ButtonWidgetConfig,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  CreatureGridView,
  PopupSimulationView,
  PopupSimulationViewAnchor
} from '../views'
import {Activity, ActivityConfig} from './shared'

const CREATURE_GRID_START_X = 40
const CREATURE_GRID_START_Y = 17

export class SimulationFinishedActivity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private sortCreaturesButton: SortCreaturesButton

  private graphics: Graphics

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      const creature = this.appState.sortedCreatures[index]
      const gridIndex = creatureIdToIndex(creature.id)

      return {creature, gridIndex}
    }

    this.graphics = this.appView.canvas.createGraphics(1920, 1080)

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: CREATURE_GRID_START_X,
      gridStartY: CREATURE_GRID_START_Y
    })

    const widgetConfig = {
      appState: this.appState,
      appView: this.appView
    }

    const simulationWidgetConfig = {
      ...widgetConfig,
      simulationConfig: this.simulationConfig,
      simulationState: this.simulationState
    }

    this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)

    this.sortCreaturesButton = new SortCreaturesButton({
      ...widgetConfig,
      graphics: this.graphics,

      onClick: () => {
        this.appController.setActivityId(ActivityId.SortingCreatures)
      }
    })
  }

  deinitialize(): void {
    this.graphics.remove()
    this.creatureGridView.deinitialize()
    this.popupSimulationView.deinitialize()
  }

  draw(): void {
    const {canvas, height, width} = this.appView
    const {creatureGridView, graphics} = this

    canvas.image(graphics, 0, 0, width, height)

    const gridStartX = 25 // 40 minus horizontal grid margin
    const gridStartY = 5 // 17 minus vertical grid margin

    creatureGridView.draw()
    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor()

    if (gridIndex != null) {
      const creatureId = this.appState.creatureIdsByGridIndex[gridIndex]
      this.setPopupSimulationCreatureId(creatureId)

      const anchor = this.calculateAnchorForPopupSimulation(gridIndex)
      this.popupSimulationView.setAnchor(anchor)

      this.popupSimulationView.draw()
    } else {
      this.clearPopupSimulation()
    }
  }

  initialize(): void {
    const {appController} = this

    appController.sortCreatures()
    appController.updateHistory()
    appController.updateCreatureIdsByGridIndex()

    this.drawInterface()
    this.creatureGridView.initialize()
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()

    if (this.sortCreaturesButton.isUnderCursor()) {
      this.sortCreaturesButton.onClick()
    }
  }

  private drawInterface(): void {
    const {canvas, font, width} = this.appView
    const {graphics} = this

    graphics.background(220, 253, 102)

    graphics.push()
    graphics.scale(1.5)

    graphics.textAlign(canvas.CENTER)
    graphics.textFont(font, 24)
    graphics.fill(100, 100, 200)
    graphics.noStroke()

    graphics.fill(0)
    graphics.text(
      "All 1,000 creatures have been tested.  Now let's sort them!",
      width / 2 - 200,
      690
    )
    this.sortCreaturesButton.draw()

    graphics.pop()
  }

  private setPopupSimulationCreatureId(id: number): void {
    const {appState} = this

    appState.statusWindow = id

    const creature = appState.sortedCreatures[id]

    this.popupSimulationView.setCreatureInfo({creature, rank: id + 1})
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView.setCreatureInfo(null)
    this.appState.statusWindow = -4
  }

  private calculateAnchorForPopupSimulation(
    gridIndex: number
  ): PopupSimulationViewAnchor {
    let creatureRowIndex, creatureColumnIndex

    creatureRowIndex = gridIndex % CREATURE_GRID_TILES_PER_ROW
    creatureColumnIndex = Math.floor(gridIndex / CREATURE_GRID_TILES_PER_ROW)

    const creatureStartX =
      creatureRowIndex * CREATURE_GRID_TILE_WIDTH + CREATURE_GRID_START_X
    const creatureStartY =
      creatureColumnIndex * CREATURE_GRID_TILE_HEIGHT + CREATURE_GRID_START_Y

    return {
      startPositionX: creatureStartX,
      startPositionY: creatureStartY,
      endPositionX: creatureStartX + CREATURE_GRID_TILE_WIDTH,
      endPositionY: creatureStartY + CREATURE_GRID_TILE_HEIGHT,
      margin: 5
    }
  }
}

interface SortCreaturesButtonConfig extends ButtonWidgetConfig {
  graphics: Graphics
}

class SortCreaturesButton extends ButtonWidget {
  private graphics: Graphics

  constructor(config: SortCreaturesButtonConfig) {
    super(config)

    this.graphics = config.graphics
  }

  draw(): void {
    const {canvas, font, width} = this.appView
    const {graphics} = this

    graphics.noStroke()
    graphics.fill(100, 100, 200)
    graphics.rect(900, 664, 260, 40)
    graphics.fill(0)
    graphics.textAlign(canvas.CENTER)
    graphics.textFont(font, 24)
    graphics.text('Sort', width - 250, 690)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(900, 664, 260, 40)
  }
}
