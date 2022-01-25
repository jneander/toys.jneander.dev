import type {Graphics} from 'p5'

import {ActivityId} from '../constants'
import {ButtonWidget, ButtonWidgetConfig, CreatureGridView} from '../views'
import {Activity, ActivityConfig} from './shared'

export class PropagateCreaturesActivity extends Activity {
  private creatureGridView: CreatureGridView
  private backButton: BackButton

  private graphics: Graphics

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      return {
        creature: this.appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    }

    this.graphics = this.appView.canvas.createGraphics(1920, 1080)

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: 40,
      gridStartY: 40
    })

    this.backButton = new BackButton({
      appView: this.appView,
      graphics: this.graphics,

      onClick: () => {
        this.appController.setActivityId(ActivityId.GenerationView)
      }
    })
  }

  deinitialize(): void {
    this.graphics.remove()
    this.creatureGridView.deinitialize()
  }

  initialize(): void {
    this.appController.propagateCreatures()

    this.drawInterface()
    this.initializeCreatureGrid()
  }

  onMouseReleased(): void {
    if (this.backButton.isUnderCursor()) {
      this.backButton.onClick()
    }
  }

  private initializeCreatureGrid(): void {
    const {canvas} = this.appView

    this.creatureGridView.initialize()

    const gridStartX = 25 // 40 minus horizontal grid margin
    const gridStartY = 28 // 40 minus vertical grid margin

    canvas.image(this.creatureGridView.graphics, gridStartX, gridStartY)
  }

  private drawInterface(): void {
    const {appStore, appView, graphics} = this
    const {canvas, font, height, width} = appView

    graphics.background(220, 253, 102)

    graphics.push()
    graphics.scale(1.5)

    graphics.textAlign(canvas.CENTER)
    graphics.textFont(font, 24)
    graphics.fill(100, 100, 200)
    graphics.noStroke()

    graphics.fill(0)
    graphics.text(
      'These are the 1000 creatures of generation #' +
        (appStore.getState().generationCount + 1) +
        '.',
      width / 2,
      30
    )
    graphics.text(
      'What perils will they face?  Find out next time!',
      width / 2 - 130,
      700
    )
    this.backButton.draw()

    graphics.pop()

    canvas.image(graphics, 0, 0, width, height)
  }
}

interface SkipButtonConfig extends ButtonWidgetConfig {
  graphics: Graphics
}

class BackButton extends ButtonWidget {
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
    graphics.text('Back', width - 150, 700)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(1050, 670, 160, 40)
  }
}
