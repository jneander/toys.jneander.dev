import {Store} from '@jneander/utils-state'
import {ChangeEvent, useMemo} from 'react'

import {RangeInputField} from '../../../../../shared/components'
import {P5ClientView} from '../../../../../shared/p5'
import {useStore} from '../../../../../shared/state'
import type {AppController} from '../../app-controller'
import {CreateUiFnParameters, createSketchFn} from '../../p5-utils'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {GenerationSimulationMode} from './constants'
import {CreatureInfo} from './creature-info'
import {GenerationViewP5Activity} from './p5-activity'
import type {ActivityState} from './types'

export interface GenerationViewActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerationViewActivity(props: GenerationViewActivityProps) {
  const {appController, appStore} = props

  const activityStore = useMemo(() => {
    return new Store<ActivityState>({
      generationSimulationMode: GenerationSimulationMode.Off,
      pendingGenerationCount: 0
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({
      activityStore,
      appController,
      appStore
    })
  }, [activityStore, appController, appStore])

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new GenerationViewP5Activity({
        activityController,
        activityStore,
        appController,
        appStore,
        p5Wrapper
      })
    }

    return createSketchFn({createUiFn})
  }, [activityController, activityStore, appController, appStore])

  const {generationCount, selectedGeneration} = useStore(appStore)

  function handleStepByStepClick() {
    activityController.performStepByStepSimulation()
  }

  function handleQuickClick() {
    activityController.performQuickGenerationSimulation()
  }

  function handleAsapClick() {
    activityController.performAsapGenerationSimulation()
  }

  function handleAlapClick() {
    activityController.startAlapGenerationSimulation()
  }

  function handleSelectedGenerationChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = Number.parseInt(event.target.value, 10)

    if (value !== selectedGeneration) {
      appStore.setState({selectedGeneration: value})
    }
  }

  const historyEntry = activityController.getSelectedGenerationHistoryEntry()

  return (
    <div>
      <div>
        <button onClick={handleStepByStepClick} type="button">
          Do 1 step-by-step generation
        </button>

        <button onClick={handleQuickClick} type="button">
          Do 1 quick generation
        </button>

        <button onClick={handleAsapClick} type="button">
          Do 1 gen ASAP
        </button>

        <button onClick={handleAlapClick} type="button">
          Do gens ALAP
        </button>
      </div>

      {generationCount > 0 && (
        <RangeInputField
          labelText="Displayed Generation"
          max={generationCount}
          min={Math.min(1, generationCount - 1)}
          onChange={handleSelectedGenerationChange}
          value={selectedGeneration}
        />
      )}

      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      {historyEntry != null && (
        <div>
          <CreatureInfo
            creature={historyEntry.fastest}
            key={historyEntry.fastest.id}
            rankText="Best"
            simulationConfig={appController.getSimulationConfig()}
          />

          <CreatureInfo
            creature={historyEntry.median}
            key={historyEntry.median.id}
            rankText="Median"
            simulationConfig={appController.getSimulationConfig()}
          />

          <CreatureInfo
            creature={historyEntry.slowest}
            key={historyEntry.slowest.id}
            rankText="Worst"
            simulationConfig={appController.getSimulationConfig()}
          />
        </div>
      )}
    </div>
  )
}
