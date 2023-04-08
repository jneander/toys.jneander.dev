import {Store} from '@jneander/utils-state'
import {ChangeEvent, useMemo} from 'react'

import {RangeInputField} from '../../../../../shared/components'
import {useStore} from '../../../../../shared/state'
import type {AppController} from '../../app-controller'
import {FitnessDistributionChart, PercentilesChart, PopulationsChart} from '../../charts'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {GenerationSimulationMode} from './constants'
import {CreatureInfo} from './creature-info'
import type {ActivityState} from './types'

import styles from './styles.module.scss'

export interface GenerationViewActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerationViewActivity(props: GenerationViewActivityProps) {
  const {appController, appStore} = props

  const activityStore = useMemo(() => {
    return new Store<ActivityState>({
      currentGenerationSimulation: null,
      generationSimulationMode: GenerationSimulationMode.Off,
      pendingGenerationCount: 0,
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({
      activityStore,
      appController,
      appStore,
    })
  }, [activityStore, appController, appStore])

  const {currentGenerationSimulation, pendingGenerationCount} = useStore(activityStore)
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

  function handleEndAlapClick() {
    activityController.endAlapGenerationSimulation()
  }

  function handleSelectedGenerationChange(event: ChangeEvent<HTMLInputElement>) {
    const value = Number.parseInt(event.target.value, 10)

    if (value !== selectedGeneration) {
      appStore.setState({selectedGeneration: value})
    }
  }

  const historyEntry = activityController.getSelectedGenerationHistoryEntry()

  let displayedPendingGenerationCount = pendingGenerationCount
  if (pendingGenerationCount === 0 && currentGenerationSimulation) {
    displayedPendingGenerationCount = 1
  }

  return (
    <div className={styles.Layout}>
      <div className={styles.Actions}>
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

        <button onClick={handleEndAlapClick} type="button">
          End ALAP
        </button>
      </div>

      <div className={styles.GenerationRange}>
        <RangeInputField
          labelText="Displayed Generation"
          disabled={generationCount === 0}
          max={generationCount}
          min={Math.min(1, generationCount - 1)}
          onChange={handleSelectedGenerationChange}
          value={selectedGeneration}
        />
      </div>

      <p>
        <span>Generation {selectedGeneration}</span>

        {displayedPendingGenerationCount === 1 && (
          <>
            &nbsp;— <span>Simulating next generation...</span>
          </>
        )}

        {displayedPendingGenerationCount > 1 && (
          <>
            &nbsp;— <span>Simulating next {displayedPendingGenerationCount} generations...</span>
          </>
        )}
      </p>

      <div className={styles.Charts}>
        <div>
          <div className={styles.ChartContainer}>
            <PercentilesChart appStore={appStore} />
          </div>

          <div className={styles.PopulationsChartContainer}>
            <PopulationsChart appStore={appStore} />
          </div>
        </div>

        <div>
          <div className={styles.Creatures}>
            {historyEntry != null && (
              <>
                <CreatureInfo
                  creature={historyEntry.bestCreature}
                  key={historyEntry.bestCreature.id}
                  rankText="Best"
                  simulationConfig={appController.getSimulationConfig()}
                />

                <CreatureInfo
                  creature={historyEntry.medianCreature}
                  key={historyEntry.medianCreature.id}
                  rankText="Median"
                  simulationConfig={appController.getSimulationConfig()}
                />

                <CreatureInfo
                  creature={historyEntry.worstCreature}
                  key={historyEntry.worstCreature.id}
                  rankText="Worst"
                  simulationConfig={appController.getSimulationConfig()}
                />
              </>
            )}
          </div>

          <div className={styles.ChartContainer}>
            <FitnessDistributionChart appStore={appStore} />
          </div>
        </div>
      </div>
    </div>
  )
}
