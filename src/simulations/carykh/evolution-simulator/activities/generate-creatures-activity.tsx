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
        getCreatureAndGridIndexFn
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
}

class GenerateCreaturesP5Activity extends Activity {
  private creatureGridView: CreatureGridView

  constructor(config: GenerateCreaturesActivityConfig) {
    super(config)

    const {getCreatureAndGridIndexFn} = config

    this.creatureGridView = new CreatureGridView({
      appView: this.appView,
      getCreatureAndGridIndexFn,
      gridStartX: 40,
      gridStartY: 17
    })
  }

  initialize(): void {
    this.appView.canvas.background(220, 253, 102)
    this.initializeCreatureGrid()
  }

  private initializeCreatureGrid(): void {
    this.creatureGridView.initialize()

    const gridStartX = 40 - CREATURE_GRID_MARGIN_X
    const gridStartY = 17 - CREATURE_GRID_MARGIN_Y

    this.appView.canvas.image(
      this.creatureGridView.graphics,
      gridStartX,
      gridStartY
    )
  }
}
