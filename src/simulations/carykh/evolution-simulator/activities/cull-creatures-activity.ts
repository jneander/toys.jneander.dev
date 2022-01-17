import {ActivityId} from '../constants'
import {CreatureGridView, PopupSimulationView, Widget} from '../views'
import {Activity, ActivityConfig} from './shared'

export class CullCreaturesActivity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private propagateCreaturesButton: PropagateCreaturesButton

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
    this.propagateCreaturesButton = new PropagateCreaturesButton(widgetConfig)
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
    this.appController.cullCreatures()
    this.appState.viewTimer = 0

    this.drawInterface()
    this.creatureGridView.draw()
  }

  onMouseReleased(): void {
    if (this.propagateCreaturesButton.isUnderCursor()) {
      this.propagateCreaturesButton.onClick()
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
      'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
      width / 2,
      30
    )
    screenGraphics.text(
      'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
      width / 2 - 130,
      700
    )
    this.propagateCreaturesButton.draw()

    screenGraphics.pop()
  }
}

class PropagateCreaturesButton extends Widget {
  draw(): void {
    const {canvas, font, screenGraphics, width} = this.appView

    screenGraphics.noStroke()
    screenGraphics.fill(100, 100, 200)
    screenGraphics.rect(1050, 670, 160, 40)
    screenGraphics.fill(0)
    screenGraphics.textAlign(canvas.CENTER)
    screenGraphics.textFont(font, 24)
    screenGraphics.text('Reproduce', width - 150, 700)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(1050, 670, 160, 40)
  }

  onClick(): void {
    this.appController.setActivityId(ActivityId.PropagateCreatures)
  }
}
