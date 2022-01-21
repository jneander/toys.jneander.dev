import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN
} from './constants'
import {CreatureManipulator} from './creatures'
import {creatureIdToIndex, speciesIdForCreature} from './helpers'
import {GenerationSimulation, SimulationConfig} from './simulation'
import type {
  AppState,
  GenerationHistoryEntry,
  RandomNumberFn,
  SimulationState,
  SpeciesCount
} from './types'

const lastCreatureIndex = CREATURE_COUNT - 1
const midCreatureIndex = Math.floor(CREATURE_COUNT / 2) - 1

export interface AppControllerConfig {
  appState: AppState
  randomFractFn: RandomNumberFn
  simulationConfig: SimulationConfig
  simulationState: SimulationState
}

export class AppController {
  generationSimulation: GenerationSimulation

  private config: AppControllerConfig

  private creatureManipulator: CreatureManipulator

  constructor(config: AppControllerConfig) {
    this.config = config

    const {randomFractFn} = config

    this.creatureManipulator = new CreatureManipulator({randomFractFn})

    this.generationSimulation = new GenerationSimulation({
      appState: config.appState,
      simulationConfig: config.simulationConfig,
      simulationState: config.simulationState
    })
  }

  generateCreatures(): void {
    const {appState} = this.config

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = this.creatureManipulator.generateCreature(i + 1)
      appState.creaturesInLatestGeneration[i] = creature
    }
  }

  updateCreatureIdsByGridIndex(): void {
    const {appState} = this.config

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const gridIndex = creatureIdToIndex(creature.id)
      appState.creatureIdsByGridIndex[gridIndex] = i
    }
  }

  sortCreatures(): void {
    const {appState} = this.config

    appState.sortedCreatures = [...appState.creaturesInLatestGeneration].sort(
      (creatureA, creatureB) => creatureB.fitness - creatureA.fitness
    )
  }

  updateHistory(): void {
    const {appState} = this.config

    appState.fitnessPercentileHistory.push(
      new Array<number>(FITNESS_PERCENTILE_CREATURE_INDICES.length)
    )
    for (let i = 0; i < FITNESS_PERCENTILE_CREATURE_INDICES.length; i++) {
      appState.fitnessPercentileHistory[appState.generationCount + 1][i] =
        appState.sortedCreatures[FITNESS_PERCENTILE_CREATURE_INDICES[i]].fitness
    }

    const historyEntry: GenerationHistoryEntry = {
      fastest: appState.sortedCreatures[0].clone(),
      median: appState.sortedCreatures[midCreatureIndex].clone(),
      slowest: appState.sortedCreatures[lastCreatureIndex].clone()
    }

    appState.generationHistoryMap[appState.generationCount + 1] = historyEntry

    const beginBar = new Array<number>(HISTOGRAM_BAR_SPAN).fill(0)

    appState.histogramBarCounts.push(beginBar)

    const speciesCountBySpeciesId: {[speciesId: number]: number} = {}

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const bar = Math.floor(
        appState.sortedCreatures[i].fitness * HISTOGRAM_BARS_PER_METER -
          HISTOGRAM_BAR_MIN
      )

      if (bar >= 0 && bar < HISTOGRAM_BAR_SPAN) {
        appState.histogramBarCounts[appState.generationCount + 1][bar]++
      }

      const speciesId = speciesIdForCreature(appState.sortedCreatures[i])
      speciesCountBySpeciesId[speciesId] =
        speciesCountBySpeciesId[speciesId] || 0
      speciesCountBySpeciesId[speciesId]++
    }

    // Ensure species counts are sorted consistently by species ID.
    const mapEntries: SpeciesCount[] = Object.entries(speciesCountBySpeciesId)
      .map(([speciesId, count]) => {
        return {speciesId: Number(speciesId), count}
      })
      .sort((speciesCountA, speciesCountB) => {
        return speciesCountA.speciesId - speciesCountB.speciesId
      })

    appState.speciesCountsHistoryMap[appState.generationCount + 1] = mapEntries
  }

  cullCreatures(): void {
    const {appState, randomFractFn} = this.config

    for (let i = 0; i < 500; i++) {
      const fitnessRankSurvivalChance = i / CREATURE_COUNT
      const cullingThreshold = (Math.pow(randomFractFn(-1, 1), 3) + 1) / 2 // cube function

      let survivingCreatureIndex
      let culledCreatureIndex

      if (fitnessRankSurvivalChance <= cullingThreshold) {
        survivingCreatureIndex = i
        culledCreatureIndex = lastCreatureIndex - i
      } else {
        survivingCreatureIndex = lastCreatureIndex - i
        culledCreatureIndex = i
      }

      const survivingCreature = appState.sortedCreatures[survivingCreatureIndex]
      survivingCreature.alive = true

      const culledCreature = appState.sortedCreatures[culledCreatureIndex]
      culledCreature.alive = false
    }
  }

  propagateCreatures(): void {
    const {appState} = this.config

    // Reproduce and mutate

    for (let i = 0; i < 500; i++) {
      let survivingCreatureIndex
      let culledCreatureIndex

      if (appState.sortedCreatures[i].alive) {
        survivingCreatureIndex = i
        culledCreatureIndex = lastCreatureIndex - i
      } else {
        survivingCreatureIndex = lastCreatureIndex - i
        culledCreatureIndex = i
      }

      const survivingCreature = appState.sortedCreatures[survivingCreatureIndex]
      const culledCreature = appState.sortedCreatures[culledCreatureIndex]

      // Next generation includes a clone and mutated offspring
      appState.sortedCreatures[survivingCreatureIndex] =
        survivingCreature.clone(survivingCreature.id + CREATURE_COUNT)
      appState.sortedCreatures[culledCreatureIndex] =
        this.creatureManipulator.modifyCreature(
          survivingCreature,
          culledCreature.id + CREATURE_COUNT
        )
    }

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const index = creatureIdToIndex(creature.id)
      appState.creaturesInLatestGeneration[index] = creature.clone()
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
