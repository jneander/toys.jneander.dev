import {ActivityId} from '../constants'
import {creatureIdToIndex} from '../helpers'
import {CreatureGridView, PopupSimulationView, Widget} from '../views'
import {Activity, ActivityConfig} from './shared'

export class SimulationFinishedActivity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private sortCreaturesButton: SortCreaturesButton

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      const creature = this.appState.sortedCreatures[index]
      const gridIndex = creatureIdToIndex(creature.id)

      return {creature, gridIndex}
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
    this.sortCreaturesButton = new SortCreaturesButton(widgetConfig)
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
    const gridStartY = 5 // 17 minus vertical grid margin

    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor(40, 17)

    if (gridIndex != null) {
      const creatureId = this.appState.creatureIdsByGridIndex[gridIndex]
      this.appController.setPopupSimulationCreatureId(creatureId)
      this.popupSimulationView.draw()
    } else {
      this.appController.clearPopupSimulation()
    }
  }

  initialize(): void {
    const {appController, appState} = this

    appController.sortCreatures()
    appController.updateHistory()

    appState.viewTimer = 0
    appController.updateCreatureIdsByGridIndex()

    this.drawInterface()
    this.creatureGridView.draw()
  }

  onMouseReleased(): void {
    if (this.sortCreaturesButton.isUnderCursor()) {
      this.sortCreaturesButton.onClick()
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
    screenGraphics.text(
      "All 1,000 creatures have been tested.  Now let's sort them!",
      width / 2 - 200,
      690
    )
    this.sortCreaturesButton.draw()

    screenGraphics.pop()
  }
}

class SortCreaturesButton extends Widget {
  draw(): void {
    const {canvas, font, screenGraphics, width} = this.appView

    screenGraphics.noStroke()
    screenGraphics.fill(100, 100, 200)
    screenGraphics.rect(900, 664, 260, 40)
    screenGraphics.fill(0)
    screenGraphics.textAlign(canvas.CENTER)
    screenGraphics.textFont(font, 24)
    screenGraphics.text('Sort', width - 250, 690)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(900, 664, 260, 40)
  }

  onClick(): void {
    this.appController.setActivityId(ActivityId.SortingCreatures)
  }
}
