import type {Graphics} from 'p5'
import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'
import {creatureIdToIndex} from '../helpers'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_MARGIN_X,
  CREATURE_GRID_MARGIN_Y,
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH,
  CreatureGridView,
  CreatureGridViewConfig,
  PopupSimulationView,
  PopupSimulationViewAnchor
} from '../views'
import {Activity, ActivityConfig} from './shared'

export interface SimulationFinishedActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedActivity(
  props: SimulationFinishedActivityProps
) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    function getCreatureAndGridIndexFn(index: number) {
      const creature = appStore.getState().creaturesInLatestGeneration[index]
      const gridIndex = creatureIdToIndex(creature.id)

      return {creature, gridIndex}
    }

    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new SimulationFinishedP5Activity({
        appController,
        appStore,
        appView,
        getCreatureAndGridIndexFn,
        gridStartX: 40,
        gridStartY: 17
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handleSortClick() {
    appController.setActivityId(ActivityId.SortingCreatures)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </div>
  )
}

interface SimulationFinishedActivityConfig extends ActivityConfig {
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
  gridStartX: number
  gridStartY: number
}

class SimulationFinishedP5Activity extends Activity {
  private creatureGridView: CreatureGridView
  private popupSimulationView: PopupSimulationView

  private graphics: Graphics

  private gridStartX: number
  private gridStartY: number

  constructor(config: SimulationFinishedActivityConfig) {
    super(config)

    this.graphics = this.appView.canvas.createGraphics(1920, 1080)

    this.gridStartX = config.gridStartX
    this.gridStartY = config.gridStartY

    const {getCreatureAndGridIndexFn} = config

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: this.gridStartX,
      gridStartY: this.gridStartY
    })

    this.popupSimulationView = new PopupSimulationView({
      appView: this.appView,
      simulationConfig: this.appController.getSimulationConfig()
    })
  }

  draw(): void {
    const {canvas, height, width} = this.appView
    const {creatureGridView, graphics} = this

    canvas.image(graphics, 0, 0, width, height)

    const gridStartX = this.gridStartX - CREATURE_GRID_MARGIN_X
    const gridStartY = this.gridStartY - CREATURE_GRID_MARGIN_Y

    creatureGridView.draw()
    canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

    /*
     * When the cursor is over any of the creature tiles, the popup simulation
     * will be displayed for the associated creature.
     */

    const gridIndex = creatureGridView.getGridIndexUnderCursor()

    if (gridIndex != null) {
      this.setPopupSimulationCreatureInfo(gridIndex)

      const anchor = this.calculateAnchorForPopupSimulation(gridIndex)
      this.popupSimulationView.setAnchor(anchor)

      this.popupSimulationView.draw()
    } else {
      this.clearPopupSimulation()
    }
  }

  initialize(): void {
    this.graphics.background(220, 253, 102)
    this.creatureGridView.initialize()
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()
  }

  private setPopupSimulationCreatureInfo(
    generationCreatureIndex: number
  ): void {
    const creature =
      this.appStore.getState().creaturesInLatestGeneration[
        generationCreatureIndex
      ]

    this.popupSimulationView.setCreatureInfo({
      creature,
      rank: generationCreatureIndex + 1
    })
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
      creatureRowIndex * CREATURE_GRID_TILE_WIDTH + this.gridStartX
    const creatureStartY =
      creatureColumnIndex * CREATURE_GRID_TILE_HEIGHT + this.gridStartY

    return {
      startPositionX: creatureStartX,
      startPositionY: creatureStartY,
      endPositionX: creatureStartX + CREATURE_GRID_TILE_WIDTH,
      endPositionY: creatureStartY + CREATURE_GRID_TILE_HEIGHT,
      margin: 5
    }
  }
}
