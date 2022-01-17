import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreatureGridView, PopupSimulationView, Widget} from '../views'
import {Activity, ActivityConfig} from './shared'

export class SortedCreaturesActivity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private cullCreaturesButton: CullCreaturesButton

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      return {
        creature: this.appState.sortedCreatures[index],
        gridIndex: index
      }
    }

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
    this.cullCreaturesButton = new CullCreaturesButton(widgetConfig)
  }

  deinitialize(): void {
    this.creatureGridView.deinitialize()
    this.popupSimulationView.deinitialize()
  }

  draw(): void {
    const {canvas, height, screenGraphics, width} = this.appView
    const {creatureGridView} = this

    canvas.image(screenGraphics, 0, 0, width, height)

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
    this.drawInterface()
    this.creatureGridView.draw()
  }

  onMouseReleased(): void {
    if (this.cullCreaturesButton.isUnderCursor()) {
      this.cullCreaturesButton.onClick()
    }
  }

  private drawInterface(): void {
    const {canvas, font, screenGraphics, width} = this.appView

    screenGraphics.background(220, 253, 102)

    screenGraphics.push()
    screenGraphics.scale(1.5)

    screenGraphics.textAlign(canvas.CENTER)
    screenGraphics.textFont(font, 24)
    screenGraphics.fill(100, 100, 200)
    screenGraphics.noStroke()

    screenGraphics.fill(0)
    screenGraphics.text('Fastest creatures at the top!', width / 2, 30)
    screenGraphics.text(
      'Slowest creatures at the bottom. (Going backward = slow)',
      width / 2 - 200,
      700
    )
    this.cullCreaturesButton.draw()

    screenGraphics.pop()
  }
}

class CullCreaturesButton extends Widget {
  draw(): void {
    const {canvas, font, screenGraphics, width} = this.appView

    screenGraphics.noStroke()
    screenGraphics.fill(100, 100, 200)
    screenGraphics.rect(900, 670, 260, 40)
    screenGraphics.fill(0)
    screenGraphics.textAlign(canvas.CENTER)
    screenGraphics.textFont(font, 24)
    screenGraphics.text(
      `Kill ${Math.floor(CREATURE_COUNT / 2)}`,
      width - 250,
      700
    )
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(900, 670, 260, 40)
  }

  onClick(): void {
    this.appController.setActivityId(ActivityId.CullCreatures)
  }
}
