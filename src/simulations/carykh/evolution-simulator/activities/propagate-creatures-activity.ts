import {ActivityId} from '../constants'
import {creatureIdToIndex} from '../helpers'
import {CreatureGridView, Widget} from '../views'
import {Activity, ActivityConfig} from './shared'

export class PropagateCreaturesActivity extends Activity {
  private creatureGridView: CreatureGridView
  private backButton: PropagatedCreaturesBackButton

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      let creature = this.appState.sortedCreatures[index]
      const latestIndex = creatureIdToIndex(creature.id)
      creature = this.appState.creaturesInLatestGeneration[latestIndex]

      return {creature, gridIndex: index}
    }

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn
    })

    this.backButton = new PropagatedCreaturesBackButton({
      appController: this.appController,
      appState: this.appState,
      appView: this.appView
    })
  }

  deinitialize(): void {
    this.creatureGridView.deinitialize()
  }

  initialize(): void {
    this.appController.propagateCreatures()

    this.drawInterface()
    this.drawCreatureGrid()
  }

  onMouseReleased(): void {
    if (this.backButton.isUnderCursor()) {
      this.backButton.onClick()
    }
  }

  private drawCreatureGrid(): void {
    const {canvas} = this.appView

    this.creatureGridView.draw()

    const gridStartX = 25 // 40 minus horizontal grid margin
    const gridStartY = 28 // 40 minus vertical grid margin

    canvas.image(this.creatureGridView.graphics, gridStartX, gridStartY)
  }

  private drawInterface(): void {
    const {appState, appView} = this
    const {canvas, font, height, screenGraphics, width} = appView

    screenGraphics.background(220, 253, 102)

    screenGraphics.push()
    screenGraphics.scale(1.5)

    screenGraphics.textAlign(canvas.CENTER)
    screenGraphics.textFont(font, 24)
    screenGraphics.fill(100, 100, 200)
    screenGraphics.noStroke()

    screenGraphics.fill(0)
    screenGraphics.text(
      'These are the 1000 creatures of generation #' +
        (appState.generationCount + 1) +
        '.',
      width / 2,
      30
    )
    screenGraphics.text(
      'What perils will they face?  Find out next time!',
      width / 2 - 130,
      700
    )
    this.backButton.draw()

    screenGraphics.pop()

    canvas.image(screenGraphics, 0, 0, width, height)
  }
}

class PropagatedCreaturesBackButton extends Widget {
  draw(): void {
    const {canvas, font, screenGraphics, width} = this.appView

    screenGraphics.noStroke()
    screenGraphics.fill(100, 100, 200)
    screenGraphics.rect(1050, 670, 160, 40)
    screenGraphics.fill(0)
    screenGraphics.textAlign(canvas.CENTER)
    screenGraphics.textFont(font, 24)
    screenGraphics.text('Back', width - 150, 700)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(1050, 670, 160, 40)
  }

  onClick(): void {
    this.appController.setActivityId(ActivityId.GenerationView)
  }
}
