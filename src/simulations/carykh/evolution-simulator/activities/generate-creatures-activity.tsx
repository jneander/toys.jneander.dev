import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {ButtonWidget, CreatureGridView} from '../views'
import {Activity, ActivityConfig} from './shared'

export interface GenerateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerateCreaturesActivity(
  props: GenerateCreaturesActivityProps
) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    return createSketchFn({appController, appStore})
  }, [appController, appStore])

  return <P5ClientView sketch={sketchFn} />
}

export class GenerateCreaturesP5Activity extends Activity {
  private creatureGridView: CreatureGridView
  private backButton: BackButton

  constructor(config: ActivityConfig) {
    super(config)

    const getCreatureAndGridIndexFn = (index: number) => {
      return {
        creature: this.appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    }

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: 40,
      gridStartY: 17
    })

    this.backButton = new BackButton({
      appView: this.appView,

      onClick: () => {
        this.appStore.setState({generationCount: 0})
        this.appController.setActivityId(ActivityId.GenerationView)
      }
    })
  }

  initialize(): void {
    this.appController.generateCreatures()

    this.drawInterface()
    this.initializeCreatureGrid()
  }

  onMouseReleased(): void {
    if (this.backButton.isUnderCursor()) {
      this.backButton.onClick()
    }
  }

  private initializeCreatureGrid(): void {
    this.creatureGridView.initialize()

    const gridStartX = 25 // 40 minus horizontal grid margin
    const gridStartY = 5 // 17 minus vertical grid margin

    this.appView.canvas.image(
      this.creatureGridView.graphics,
      gridStartX,
      gridStartY
    )
  }

  private drawInterface(): void {
    const {canvas, font, width} = this.appView

    canvas.background(220, 253, 102)

    canvas.noStroke()
    canvas.fill(0)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 24)
    canvas.text(
      `Here are your ${CREATURE_COUNT} randomly generated creatures!!!`,
      width / 2 - 200,
      690
    )
    this.backButton.draw()
  }
}

class BackButton extends ButtonWidget {
  draw(): void {
    const {canvas, font, width} = this.appView

    canvas.noStroke()
    canvas.fill(100, 100, 200)
    canvas.rect(900, 664, 260, 40)
    canvas.fill(0)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 24)
    canvas.text('Back', width - 250, 690)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(900, 664, 260, 40)
  }
}
