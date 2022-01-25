import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {CreatureGridView} from '../views'
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
    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new GenerateCreaturesP5Activity({appController, appStore, appView})
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

class GenerateCreaturesP5Activity extends Activity {
  private creatureGridView: CreatureGridView

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
  }

  initialize(): void {
    this.appController.generateCreatures()

    this.appView.canvas.background(220, 253, 102)
    this.initializeCreatureGrid()
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
}
