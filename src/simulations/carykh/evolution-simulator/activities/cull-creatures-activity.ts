import type {Graphics} from 'p5'

import {ActivityId} from '../constants'
import {
  ButtonWidget,
  ButtonWidgetConfig,
  CreatureGridView,
  PopupSimulationView
} from '../views'
import {Activity, ActivityConfig} from './shared'

export class CullCreaturesActivity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private propagateCreaturesButton: PropagateCreaturesButton

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
      getCreatureAndGridIndexFn
    })

    const widgetConfig = {
      appController: this.appController,
      appState: this.appState,
      appView: this.appView
    }

    const simulationWidgetConfig = {
      ...widgetConfig,
      simulationConfig: this.simulationConfig,
      simulationState: this.simulationState
    }

    this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)

    this.propagateCreaturesButton = new PropagateCreaturesButton({
      ...widgetConfig,
      graphics: this.graphics,

      onClick: () => {
        this.appController.setActivityId(ActivityId.PropagateCreatures)
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

    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor(40, 42)

    if (gridIndex != null) {
      this.appController.setPopupSimulationCreatureId(gridIndex)
      this.popupSimulationView.draw()
    } else {
      this.appController.clearPopupSimulation()
    }
  }

  initialize(): void {
    this.appController.cullCreatures()

    this.drawInterface()
    this.creatureGridView.draw()
  }

  onMouseReleased(): void {
    if (this.propagateCreaturesButton.isUnderCursor()) {
      this.propagateCreaturesButton.onClick()
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
      'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
      width / 2,
      30
    )
    graphics.text(
      'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
      width / 2 - 130,
      700
    )
    this.propagateCreaturesButton.draw()

    graphics.pop()
  }
}

interface SkipButtonConfig extends ButtonWidgetConfig {
  graphics: Graphics
}

class PropagateCreaturesButton extends ButtonWidget {
  private graphics: Graphics

  constructor(config: SkipButtonConfig) {
    super(config)

    this.graphics = config.graphics
  }

  draw(): void {
    const {canvas, font, width} = this.appView
    const {graphics} = this

    graphics.noStroke()
    graphics.fill(100, 100, 200)
    graphics.rect(1050, 670, 160, 40)
    graphics.fill(0)
    graphics.textAlign(canvas.CENTER)
    graphics.textFont(font, 24)
    graphics.text('Reproduce', width - 150, 700)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(1050, 670, 160, 40)
  }
}
