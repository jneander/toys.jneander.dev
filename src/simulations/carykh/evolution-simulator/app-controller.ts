import type {RandomNumberGenerator} from '@jneander/utils-random'

import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN
} from './constants'
import {CreatureManipulator} from './creatures'
import {speciesIdForCreature} from './helpers'
import {SimulationConfig} from './simulation'
import type {AppState, GenerationHistoryEntry, SpeciesCount} from './types'

const lastCreatureIndex = CREATURE_COUNT - 1
const midCreatureIndex = Math.floor(CREATURE_COUNT / 2) - 1

export interface AppControllerConfig {
  appState: AppState
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
      randomNumberGenerator
    })
  }

  generateCreatures(): void {
    const {appState} = this.config

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = this.creatureManipulator.generateCreature(i + 1)
      appState.creaturesInLatestGeneration[i] = creature
    }
  }

  sortCreatures(): void {
    this.config.appState.creaturesInLatestGeneration.sort(
      (creatureA, creatureB) => creatureB.fitness - creatureA.fitness
    )
  }

  updateHistory(): void {
    const {appState} = this.config

    const nextGeneration = appState.generationCount + 1

    const fitnessPercentiles = new Array<number>(
      FITNESS_PERCENTILE_CREATURE_INDICES.length
    )
    for (let i = 0; i < FITNESS_PERCENTILE_CREATURE_INDICES.length; i++) {
      fitnessPercentiles[i] =
        appState.creaturesInLatestGeneration[
          FITNESS_PERCENTILE_CREATURE_INDICES[i]
        ].fitness
    }

    const histogramBarCounts = new Array<number>(HISTOGRAM_BAR_SPAN).fill(0)
    const speciesCountBySpeciesId: {[speciesId: number]: number} = {}

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const bar = Math.floor(
        appState.creaturesInLatestGeneration[i].fitness *
          HISTOGRAM_BARS_PER_METER -
          HISTOGRAM_BAR_MIN
      )

      if (bar >= 0 && bar < HISTOGRAM_BAR_SPAN) {
        histogramBarCounts[bar]++
      }

      const speciesId = speciesIdForCreature(
        appState.creaturesInLatestGeneration[i]
      )
      speciesCountBySpeciesId[speciesId] =
        speciesCountBySpeciesId[speciesId] || 0
      speciesCountBySpeciesId[speciesId]++
    }

    // Ensure species counts are sorted consistently by species ID.
    const speciesCounts: SpeciesCount[] = Object.entries(
      speciesCountBySpeciesId
    )
      .map(([speciesId, count]) => {
        return {speciesId: Number(speciesId), count}
      })
      .sort((speciesCountA, speciesCountB) => {
        return speciesCountA.speciesId - speciesCountB.speciesId
      })

    const historyEntry: GenerationHistoryEntry = {
      fastest: appState.creaturesInLatestGeneration[0].clone(),
      median: appState.creaturesInLatestGeneration[midCreatureIndex].clone(),
      slowest: appState.creaturesInLatestGeneration[lastCreatureIndex].clone(),
      fitnessPercentiles,
      histogramBarCounts,
      speciesCounts
    }

    appState.generationHistoryMap[nextGeneration] = historyEntry
  }

  cullCreatures(): void {
    const {appState, randomNumberGenerator} = this.config

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

      const survivingCreature =
        appState.creaturesInLatestGeneration[survivingCreatureIndex]
      survivingCreature.alive = true

      const culledCreature =
        appState.creaturesInLatestGeneration[culledCreatureIndex]
      culledCreature.alive = false
    }
  }

  propagateCreatures(): void {
    const {appState} = this.config

    // Reproduce and mutate

    for (let i = 0; i < 500; i++) {
      let survivingCreatureIndex
      let culledCreatureIndex

      if (appState.creaturesInLatestGeneration[i].alive) {
        survivingCreatureIndex = i
        culledCreatureIndex = lastCreatureIndex - i
      } else {
        survivingCreatureIndex = lastCreatureIndex - i
        culledCreatureIndex = i
      }

      const survivingCreature =
        appState.creaturesInLatestGeneration[survivingCreatureIndex]
      const culledCreature =
        appState.creaturesInLatestGeneration[culledCreatureIndex]

      // Next generation includes a clone and mutated offspring
      appState.creaturesInLatestGeneration[survivingCreatureIndex] =
        survivingCreature.clone(survivingCreature.id + CREATURE_COUNT)
      appState.creaturesInLatestGeneration[culledCreatureIndex] =
        this.creatureManipulator.modifyCreature(
          survivingCreature,
          culledCreature.id + CREATURE_COUNT
        )
    }

    appState.generationCount++

    if (appState.selectedGeneration === appState.generationCount - 1) {
      // Continue selecting latest generation.
      appState.selectedGeneration = appState.generationCount
    }
  }

  setActivityId(activityId: ActivityId): void {
    this.config.appState.nextActivityId = activityId
  }
}
