import type {RandomNumberGenerator} from '@jneander/utils-random'

import {
  type ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  HISTOGRAM_BAR_SPAN,
} from './constants'
import {CreatureManipulator, fitnessToHistogramBarIndex, speciesIdForCreature} from './creatures'
import type {SimulationConfig} from './simulation'
import type {AppStore, GenerationHistoryEntry, SpeciesCount} from './types'

const lastCreatureIndex = CREATURE_COUNT - 1
const midCreatureIndex = Math.floor(CREATURE_COUNT / 2) - 1

export interface AppControllerConfig {
  appStore: AppStore
  randomNumberGenerator: RandomNumberGenerator
  simulationConfig: SimulationConfig
}

export class AppController {
  private config: AppControllerConfig

  private creatureManipulator: CreatureManipulator

  constructor(config: AppControllerConfig) {
    this.config = config

    const {randomNumberGenerator} = config

    this.creatureManipulator = new CreatureManipulator({
      randomNumberGenerator,
    })
  }

  getSimulationConfig(): SimulationConfig {
    return this.config.simulationConfig
  }

  generateCreatures(): void {
    const creaturesInLatestGeneration = []

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = this.creatureManipulator.generateCreature(i + 1)
      creaturesInLatestGeneration.push(creature)
    }

    this.config.appStore.setState({creaturesInLatestGeneration})
  }

  sortCreatures(): void {
    const {appStore} = this.config

    let {creaturesInLatestGeneration} = appStore.getState()

    creaturesInLatestGeneration = [...creaturesInLatestGeneration].sort(
      (creatureA, creatureB) => creatureB.fitness - creatureA.fitness,
    )

    appStore.setState({creaturesInLatestGeneration})
  }

  updateHistory(): void {
    const {appStore} = this.config

    const appState = appStore.getState()

    const nextGeneration = appState.generationCount + 1

    const fitnessPercentiles = new Array<number>(FITNESS_PERCENTILE_CREATURE_INDICES.length)

    for (let i = 0; i < FITNESS_PERCENTILE_CREATURE_INDICES.length; i++) {
      fitnessPercentiles[i] =
        appState.creaturesInLatestGeneration[FITNESS_PERCENTILE_CREATURE_INDICES[i]].fitness
    }

    const histogramBarCounts = new Array<number>(HISTOGRAM_BAR_SPAN).fill(0)
    const speciesCountBySpeciesId: {[speciesId: number]: number} = {}

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const bar = fitnessToHistogramBarIndex(appState.creaturesInLatestGeneration[i].fitness)

      if (bar >= 0 && bar < HISTOGRAM_BAR_SPAN) {
        histogramBarCounts[bar]++
      }

      const speciesId = speciesIdForCreature(appState.creaturesInLatestGeneration[i])
      speciesCountBySpeciesId[speciesId] = speciesCountBySpeciesId[speciesId] || 0
      speciesCountBySpeciesId[speciesId]++
    }

    // Ensure species counts are sorted consistently by species ID.
    const speciesCounts: SpeciesCount[] = Object.entries(speciesCountBySpeciesId)
      .map(([speciesId, count]) => {
        return {speciesId: Number(speciesId), count}
      })
      .sort((speciesCountA, speciesCountB) => {
        return speciesCountA.speciesId - speciesCountB.speciesId
      })

    const historyEntry: GenerationHistoryEntry = {
      bestCreature: appState.creaturesInLatestGeneration[0].clone(),
      medianCreature: appState.creaturesInLatestGeneration[midCreatureIndex].clone(),
      worstCreature: appState.creaturesInLatestGeneration[lastCreatureIndex].clone(),
      fitnessPercentiles,
      histogramBarCounts,
      speciesCounts,
    }

    appStore.setState({
      generationHistoryMap: {
        ...appState.generationHistoryMap,
        [nextGeneration]: historyEntry,
      },
    })
  }

  cullCreatures(): void {
    const {appStore, randomNumberGenerator} = this.config

    const creaturesInLatestGeneration = [...appStore.getState().creaturesInLatestGeneration]

    for (let i = 0; i < 500; i++) {
      const fitnessRankSurvivalChance = i / CREATURE_COUNT

      const randomFract = randomNumberGenerator.nextFract32(0, 1) * 2 - 1
      const cullingThreshold = (Math.pow(randomFract, 3) + 1) / 2 // cube function

      let survivingCreatureIndex
      let culledCreatureIndex

      if (fitnessRankSurvivalChance <= cullingThreshold) {
        survivingCreatureIndex = i
        culledCreatureIndex = lastCreatureIndex - i
      } else {
        survivingCreatureIndex = lastCreatureIndex - i
        culledCreatureIndex = i
      }

      /*
       * Creatures are deliberately mutated instead of replaced, for performance
       * concerns.
       */

      const survivingCreature = creaturesInLatestGeneration[survivingCreatureIndex]
      survivingCreature.alive = true

      const culledCreature = creaturesInLatestGeneration[culledCreatureIndex]
      culledCreature.alive = false

      appStore.setState({creaturesInLatestGeneration})
    }
  }

  propagateCreatures(): void {
    const {appStore} = this.config

    let {creaturesInLatestGeneration, generationCount, selectedGeneration} = appStore.getState()

    creaturesInLatestGeneration = [...creaturesInLatestGeneration]

    // Reproduce and mutate

    for (let i = 0; i < 500; i++) {
      let survivingCreatureIndex
      let culledCreatureIndex

      if (creaturesInLatestGeneration[i].alive) {
        survivingCreatureIndex = i
        culledCreatureIndex = lastCreatureIndex - i
      } else {
        survivingCreatureIndex = lastCreatureIndex - i
        culledCreatureIndex = i
      }

      const survivingCreature = creaturesInLatestGeneration[survivingCreatureIndex]
      const culledCreature = creaturesInLatestGeneration[culledCreatureIndex]

      // Next generation includes a clone and mutated offspring
      creaturesInLatestGeneration[survivingCreatureIndex] = survivingCreature.clone(
        survivingCreature.id + CREATURE_COUNT,
      )

      creaturesInLatestGeneration[culledCreatureIndex] = this.creatureManipulator.modifyCreature(
        survivingCreature,
        culledCreature.id + CREATURE_COUNT,
      )
    }

    generationCount++

    if (selectedGeneration === generationCount - 1) {
      // Continue selecting latest generation.
      selectedGeneration = generationCount
    }

    appStore.setState({
      creaturesInLatestGeneration,
      generationCount,
      selectedGeneration,
    })
  }

  setActivityId(activityId: ActivityId): void {
    this.config.appStore.setState({currentActivityId: activityId})
  }
}
