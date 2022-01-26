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

export interface GenerateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerateCreaturesActivity(
  props: GenerateCreaturesActivityProps
) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.generateCreatures()
  }, [appController])

  const sketchFn = useMemo(() => {
    function getCreatureAndGridIndexFn(index: number) {
      return {
        creature: appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    }

    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new GenerateCreaturesP5Activity({
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

  function handleBackClick() {
    appStore.setState({generationCount: 0})
    appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <p>Here are your {CREATURE_COUNT} randomly generated creatures!!!</p>

      <button onClick={handleBackClick} type="button">
        Back
      </button>
    </div>
  )
}

interface GenerateCreaturesActivityConfig extends ActivityConfig {
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
  gridStartX: number
  gridStartY: number
}

class GenerateCreaturesP5Activity extends Activity {
  private creatureGridView: CreatureGridView

  private gridStartX: number
  private gridStartY: number

  constructor(config: GenerateCreaturesActivityConfig) {
    super(config)

    this.gridStartX = config.gridStartX
    this.gridStartY = config.gridStartY

    const {getCreatureAndGridIndexFn} = config

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: this.gridStartX,
      gridStartY: this.gridStartY,
      showsHoverState: false
    })
  }

  initialize(): void {
    this.appView.canvas.background(220, 253, 102)
    this.initializeCreatureGrid()
  }

  private initializeCreatureGrid(): void {
    this.creatureGridView.initialize()

    const gridStartX = this.gridStartX - CREATURE_GRID_MARGIN_X
    const gridStartY = this.gridStartY - CREATURE_GRID_MARGIN_Y

    this.appView.canvas.image(
      this.creatureGridView.graphics,
      gridStartX,
      gridStartY
    )
  }
}
