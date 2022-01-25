import type {Graphics} from 'p5'
import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'
import {createSketchFn} from '../sketch'
import type {AppStore} from '../types'
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
const CREATURE_GRID_START_Y = 42

export interface CullCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function CullCreaturesActivity(props: CullCreaturesActivityProps) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    return createSketchFn({appController, appStore})
  }, [appController, appStore])

  return <P5ClientView sketch={sketchFn} />
}

export class CullCreaturesP5Activity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView
  private propagateCreaturesButton: PropagateCreaturesButton

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
      gridStartX: CREATURE_GRID_START_X,
      gridStartY: CREATURE_GRID_START_Y
    })

    this.popupSimulationView = new PopupSimulationView({
      appView: this.appView,
      simulationConfig: this.appController.getSimulationConfig()
    })

    this.propagateCreaturesButton = new PropagateCreaturesButton({
      appView: this.appView,
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

    creatureGridView.draw()
    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor()

    if (gridIndex != null) {
      this.setPopupSimulationCreatureId(gridIndex)

      const anchor = this.calculateAnchorForPopupSimulation(gridIndex)
      this.popupSimulationView.setAnchor(anchor)

      this.popupSimulationView.draw()
    } else {
      this.clearPopupSimulation()
    }
  }

  initialize(): void {
    this.appController.cullCreatures()

    this.drawInterface()
    this.creatureGridView.initialize()
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()

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

  private setPopupSimulationCreatureId(id: number): void {
    const creature = this.appStore.getState().creaturesInLatestGeneration[id]
    this.popupSimulationView.setCreatureInfo({creature, rank: id + 1})
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView.setCreatureInfo(null)
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
