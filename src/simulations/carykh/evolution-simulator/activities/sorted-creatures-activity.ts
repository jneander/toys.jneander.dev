import type {Graphics} from 'p5'

import {ActivityId, CREATURE_COUNT} from '../constants'
import {
  PopupSimulationView,
  ButtonWidget,
  ButtonWidgetConfig,
  CreatureGridView
} from '../views'
import {Activity, ActivityConfig} from './shared'

export class SortedCreaturesActivity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private cullCreaturesButton: CullCreaturesButton

  private graphics: Graphics

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      return {
        creature: this.appState.sortedCreatures[index],
        gridIndex: index
      }
    }

    this.graphics = this.appView.canvas.createGraphics(1920, 1080)

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: 40,
      gridStartY: 42
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
    this.cullCreaturesButton = new CullCreaturesButton({
      ...widgetConfig,
      graphics: this.graphics,

      onClick: () => {
        this.appController.setActivityId(ActivityId.CullCreatures)
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
    const gridStartY = 28 // 40 minus vertical grid margin

    creatureGridView.draw()
    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor()

    if (gridIndex != null) {
      this.setPopupSimulationCreatureId(gridIndex)
      this.popupSimulationView.draw()
    } else {
      this.clearPopupSimulation()
    }
  }

  initialize(): void {
    this.drawInterface()
    this.creatureGridView.initialize()
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()

    if (this.cullCreaturesButton.isUnderCursor()) {
      this.cullCreaturesButton.onClick()
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
    graphics.text('Fastest creatures at the top!', width / 2, 30)
    graphics.text(
      'Slowest creatures at the bottom. (Going backward = slow)',
      width / 2 - 200,
      700
    )
    this.cullCreaturesButton.draw()

    graphics.pop()
  }

  private setPopupSimulationCreatureId(id: number): void {
    const {appState} = this

    appState.statusWindow = id

    const creature = appState.sortedCreatures[id]

    this.popupSimulationView.setCreatureInfo({creature})
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView.setCreatureInfo(null)
    this.appState.statusWindow = -4
  }
}

interface CullCreaturesButtonConfig extends ButtonWidgetConfig {
  graphics: Graphics
}

class CullCreaturesButton extends ButtonWidget {
  private graphics: Graphics

  constructor(config: CullCreaturesButtonConfig) {
    super(config)

    this.graphics = config.graphics
  }

  draw(): void {
    const {canvas, font, width} = this.appView
    const {graphics} = this

    graphics.noStroke()
    graphics.fill(100, 100, 200)
    graphics.rect(900, 670, 260, 40)
    graphics.fill(0)
    graphics.textAlign(canvas.CENTER)
    graphics.textFont(font, 24)
    graphics.text(`Kill ${Math.floor(CREATURE_COUNT / 2)}`, width - 250, 700)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(900, 670, 260, 40)
  }
}
