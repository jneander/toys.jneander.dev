import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {CreatureGridView} from '../views'
import {Activity, ActivityConfig} from './shared'

export interface PropagateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function PropagateCreaturesActivity(
  props: PropagateCreaturesActivityProps
) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new PropagateCreaturesP5Activity({
        appController,
        appStore,
        appView
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

class PropagateCreaturesP5Activity extends Activity {
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
      gridStartY: 40
    })
  }

  initialize(): void {
    this.appController.propagateCreatures()

    this.appView.canvas.background(220, 253, 102)
    this.initializeCreatureGrid()
  }

  private initializeCreatureGrid(): void {
    const {canvas} = this.appView

    this.creatureGridView.initialize()

    const gridStartX = 25 // 40 minus horizontal grid margin
    const gridStartY = 28 // 40 minus vertical grid margin

    canvas.image(this.creatureGridView.graphics, gridStartX, gridStartY)
  }
}
