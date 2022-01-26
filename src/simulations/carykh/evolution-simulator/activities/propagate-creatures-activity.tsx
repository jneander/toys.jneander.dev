import {useEffect, useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_MARGIN_X,
  CREATURE_GRID_MARGIN_Y,
  CreatureGridView,
  CreatureGridViewConfig
} from '../views'
import {Activity, ActivityConfig} from './shared'

export interface PropagateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function PropagateCreaturesActivity(
  props: PropagateCreaturesActivityProps
) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.propagateCreatures()
  }, [appController])

  const sketchFn = useMemo(() => {
    function getCreatureAndGridIndexFn(index: number) {
      return {
        creature: appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    }

    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new PropagateCreaturesP5Activity({
        appController,
        appStore,
        appView,
        getCreatureAndGridIndexFn,
        gridStartX: 40,
        gridStartY: 40
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handleBackClick() {
    appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <p>
        These are the {CREATURE_COUNT} creatures of generation #
        {appStore.getState().generationCount + 1}.
      </p>

      <p>What perils will they face? Find out next time!</p>

      <button onClick={handleBackClick} type="button">
        Back
      </button>
    </div>
  )
}

interface PropagateCreaturesActivityConfig extends ActivityConfig {
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
  gridStartX: number
  gridStartY: number
}

class PropagateCreaturesP5Activity extends Activity {
  private creatureGridView: CreatureGridView

  private gridStartX: number
  private gridStartY: number

  constructor(config: PropagateCreaturesActivityConfig) {
    super(config)

    this.gridStartX = config.gridStartX
    this.gridStartY = config.gridStartY

    const {getCreatureAndGridIndexFn} = config

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: this.gridStartX,
      gridStartY: this.gridStartY
    })
  }

  initialize(): void {
    this.appView.canvas.background(220, 253, 102)
    this.initializeCreatureGrid()
  }

  private initializeCreatureGrid(): void {
    const {canvas} = this.appView

    this.creatureGridView.initialize()

    const gridStartX = this.gridStartX - CREATURE_GRID_MARGIN_X
    const gridStartY = this.gridStartY - CREATURE_GRID_MARGIN_Y

    canvas.image(this.creatureGridView.graphics, gridStartX, gridStartY)
  }
}
