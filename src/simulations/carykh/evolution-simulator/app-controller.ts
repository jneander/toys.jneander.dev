import type Creature from './Creature'
import type Simulation from './Simulation'
import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  GenerationSimulationMode,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN
} from './constants'
import {
  averagePositionOfNodes,
  creatureIdToIndex,
  historyEntryKeyForStatusWindow,
  speciesIdForCreature
} from './helpers'
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
  simulation: Simulation
  simulationState: SimulationState
}

export class AppController {
  private config: AppControllerConfig

  constructor(config: AppControllerConfig) {
    this.config = config
  }

  generateCreatures(): void {
    const {appState, simulation} = this.config

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = simulation.generateCreature(i + 1)
      appState.creaturesInLatestGeneration[i] = creature
    }
  }

  performStepByStepSimulation(): void {
    const {appState, simulationState} = this.config

    simulationState.speed = 1
    appState.creaturesTested = 0
    appState.generationSimulationMode = GenerationSimulationMode.StepByStep
    this.setSimulationState(
      appState.creaturesInLatestGeneration[appState.creaturesTested]
    )
    this.setActivityId(ActivityId.SimulationRunning)
  }

  performQuickGenerationSimulation(): void {
    const {appState} = this.config

    appState.creaturesTested = 0
    appState.generationSimulationMode = GenerationSimulationMode.Quick
    this.finishGenerationSimulationFromIndex(0)
    this.setActivityId(ActivityId.SimulationFinished)
  }

  finishGenerationSimulationFromIndex(creatureIndex: number): void {
    for (let i = creatureIndex; i < CREATURE_COUNT; i++) {
      this.setSimulationState(
        this.config.appState.creaturesInLatestGeneration[i]
      )

      for (let s = 0; s < 900; s++) {
        this.advanceSimulation()
      }

      this.setFitnessOfSimulationCreature()
    }
  }

  finishGenerationSimulation(): void {
    const {appState} = this.config

    for (let s = appState.viewTimer; s < 900; s++) {
      this.advanceSimulation()
    }

    appState.viewTimer = 0
    appState.creaturesTested++

    this.finishGenerationSimulationFromIndex(appState.creaturesTested)
    this.setActivityId(ActivityId.SimulationFinished)
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
    const {appState, simulation} = this.config

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
      appState.sortedCreatures[culledCreatureIndex] = simulation.modifyCreature(
        survivingCreature,
        culledCreature.id + CREATURE_COUNT
      )

      // Stabilize and adjust mutated offspring
      const {muscles, nodes} = appState.sortedCreatures[culledCreatureIndex]

      simulation.stabilizeNodesAndMuscles(nodes, muscles)
      simulation.adjustNodesToCenter(nodes)
    }

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const index = creatureIdToIndex(creature.id)
      appState.creaturesInLatestGeneration[index] = creature.clone()
    }

    appState.generationCount++
  }

  advanceSimulation(): void {
    this.config.simulation.advance()
    this.config.appState.viewTimer++
  }

  setActivityId(activityId: ActivityId): void {
    this.config.appState.nextActivityId = activityId
  }

  startASAP(): void {
    const {appState} = this.config

    appState.generationSimulationMode = GenerationSimulationMode.ASAP
    appState.creaturesTested = 0
  }

  setPopupSimulationCreatureId(id: number): void {
    const {appState, simulationState} = this.config

    const popupCurrentlyClosed = this.config.appState.statusWindow == -4
    appState.statusWindow = id

    let creature: Creature
    let targetCreatureId: number

    if (appState.statusWindow <= -1) {
      const historyEntry =
        appState.generationHistoryMap[appState.selectedGeneration]
      creature =
        historyEntry[historyEntryKeyForStatusWindow(appState.statusWindow)]
      targetCreatureId = creature.id
    } else {
      targetCreatureId = appState.statusWindow
      creature = appState.sortedCreatures[id]
    }

    if (
      appState.popupSimulationCreatureId !== targetCreatureId ||
      popupCurrentlyClosed
    ) {
      simulationState.timer = 0

      if (appState.pendingGenerationCount == 0) {
        // The full simulation is not running, so the popup simulation can be shown.
        appState.showPopupSimulation = true

        this.setSimulationState(creature)
        appState.popupSimulationCreatureId = targetCreatureId
      }
    }
  }

  clearPopupSimulation(): void {
    this.config.appState.statusWindow = -4
  }

  setSimulationState(simulationCreature: Creature): void {
    const {appState, simulationState} = this.config

    simulationState.creature.nodes = simulationCreature.nodes.map(node =>
      node.clone()
    )
    simulationState.creature.muscles = simulationCreature.muscles.map(muscle =>
      muscle.clone()
    )

    appState.viewTimer = 0
    simulationState.creature.id = simulationCreature.id
    simulationState.camera.zoom = 0.01
    simulationState.camera.x = 0
    simulationState.camera.y = 0
    simulationState.timer = 0
    simulationState.creature.energyUsed = 0
    simulationState.creature.totalNodeNausea = 0
    simulationState.creature.averageNodeNausea = 0
  }

  setFitnessOfSimulationCreature(): void {
    const {appState, simulationState} = this.config

    const {id, nodes} = simulationState.creature
    const {averageX} = averagePositionOfNodes(nodes)
    const index = creatureIdToIndex(id)

    appState.creaturesInLatestGeneration[index].fitness = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }
}
