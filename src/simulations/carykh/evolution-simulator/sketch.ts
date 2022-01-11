import type p5 from 'p5'
import type {Color, Font, Graphics} from 'p5'

import Creature from './Creature'
import Muscle from './Muscle'
import Node from './Node'
import Simulation from './Simulation'
import {Activity, CreatureGridViewType} from './constants'
import {toInt} from './math'
import {
  AXON_COUNT_BY_NODE_OPERATION_ID,
  NODE_OPERATION_LABELS_BY_ID
} from './node-operations'
import type {SimulationConfig, SimulationState} from './types'

export default function sketch(p5: p5) {
  const AXON_COLOR = p5.color(255, 255, 0)
  const CREATURE_COUNT = 1000
  const FITNESS_LABEL = 'Distance'
  const FITNESS_UNIT_LABEL = 'm'
  const FONT_SIZES = [50, 36, 25, 20, 16, 14, 11, 9]
  const FRAME_RATE = 60 // target frames per second
  const NODE_TEXT_LINE_MULTIPLIER_Y1 = -0.08 // These are for the lines of text on each node.
  const NODE_TEXT_LINE_MULTIPLIER_Y2 = 0.35
  const SEED = 0
  const WINDOW_SIZE_MULTIPLIER = 0.8

  const windowWidth = 1280
  const windowHeight = 720

  const lastCreatureIndex = CREATURE_COUNT - 1
  const midCreatureIndex = Math.floor(CREATURE_COUNT / 2) - 1

  const fitnessPercentileCreatureIndices = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700,
    800, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 999
  ]
  const fitnessPercentileCount = fitnessPercentileCreatureIndices.length
  const fitnessPercentileHistory: Array<number[]> = []

  let font: Font
  let barCounts: Array<number[]> = []
  let graphImage: Graphics
  let screenImage: Graphics
  let popUpImage: Graphics
  let segBarImage: Graphics
  let histBarsPerMeter = 5

  let baselineEnergy = 0.0

  let minBar = -10
  let maxBar = 100
  let barLen = maxBar - minBar
  let gensToDo = 0
  let postFontSize = 0.96
  let scaleToFixBug = 1000

  let generationCount = -1
  let sliderX = 1170
  let selectedGeneration = 0
  let draggingSlider = false
  let creaturesTested = 0

  let popupSimulationCreatureId: number | null

  let statusWindow = -4
  const creatureIdsByGridIndex = new Array<number>(CREATURE_COUNT)

  type SpeciesCount = {
    count: number
    speciesId: number
  }

  type GenerationHistoryEntry = {
    fastest: Creature
    median: Creature
    slowest: Creature
  }

  type AppState = {
    currentActivityId: Activity
    generationHistoryMap: {[generation: number]: GenerationHistoryEntry}
    showPopupSimulation: boolean
    speciesCountsHistoryMap: {[generation: number]: SpeciesCount[]}
    viewTimer: number
  }

  const appState: AppState = {
    currentActivityId: Activity.Start,
    generationHistoryMap: {},
    showPopupSimulation: false,
    speciesCountsHistoryMap: {},
    viewTimer: 0
  }

  const simulationConfig: SimulationConfig = {
    hazelStairs: -1,
    randomFloatFn: (minInclusive: number, maxExclusive: number) =>
      p5.random(minInclusive, maxExclusive)
  }

  const simulationState: SimulationState = {
    camera: {
      x: 0,
      y: 0,
      zoom: 0.015
    },

    creature: {
      averageNodeNausea: 0,
      energyUsed: 0,
      id: 0,
      muscles: [],
      nodes: [],
      totalNodeNausea: 0
    },

    speed: 1,
    timer: 0
  }

  const creaturesInLatestGeneration = new Array<Creature>(CREATURE_COUNT)

  function indexOfCreatureInLatestGeneration(creatureId: number): number {
    return (creatureId - 1) % CREATURE_COUNT
  }

  function speciesIdForCreature(creature: Creature): number {
    return (creature.nodes.length % 10) * 10 + (creature.muscles.length % 10)
  }

  function historyEntryKeyForStatusWindow(
    statusWindow: number
  ): keyof GenerationHistoryEntry {
    if (statusWindow === -3) {
      return 'slowest'
    }

    if (statusWindow === -2) {
      return 'median'
    }

    return 'fastest'
  }

  let c2: Creature[] = []

  let stepByStep: boolean
  let stepByStepSlow: boolean

  const simulation = new Simulation(simulationState, simulationConfig)

  function advanceSimulation(): void {
    simulation.advance()
    appState.viewTimer++
  }

  function inter(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }

  function getCursorPosition(): {mX: number; mY: number} {
    const mX = p5.mouseX / WINDOW_SIZE_MULTIPLIER
    const mY = p5.mouseY / WINDOW_SIZE_MULTIPLIER

    return {mX, mY}
  }

  function rectIsUnderCursor(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const {mX, mY} = getCursorPosition()

    return mX >= x && mX <= x + width && mY >= y && mY <= y + height
  }

  abstract class Widget {
    abstract draw(): void
  }

  class StartViewStartButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(windowWidth / 2 - 200, 300, 400, 200)
      p5.fill(0)
      p5.text('START', windowWidth / 2, 430)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(windowWidth / 2 - 200, 300, 400, 200)
    }

    onClick(): void {
      setActivity(Activity.GenerationView)
    }
  }

  class GenerationViewCreateButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(20, 250, 200, 100)
      p5.fill(0)
      p5.text('CREATE', 56, 312)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(20, 250, 200, 100)
    }

    onClick(): void {
      setActivity(Activity.GeneratingCreatures)
    }
  }

  class GeneratedCreaturesBackButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 100, 200)
      p5.rect(900, 664, 260, 40)
      p5.fill(0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 24)
      p5.text('Back', windowWidth - 250, 690)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      generationCount = 0
      setActivity(Activity.GenerationView)
    }
  }

  class SimulateStepByStepButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 20, 460, 40)
      p5.fill(0)
      p5.text('Do 1 step-by-step generation.', 770, 50)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(760, 20, 460, 40)
    }

    onClick(): void {
      setActivity(Activity.RequestingSimulation)
      simulationState.speed = 1
      creaturesTested = 0
      stepByStep = true
      stepByStepSlow = true
    }
  }

  class SimulateQuickButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 70, 460, 40)
      p5.fill(0)
      p5.text('Do 1 quick generation.', 770, 100)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(760, 70, 460, 40)
    }

    onClick(): void {
      setActivity(Activity.RequestingSimulation)
      creaturesTested = 0
      stepByStep = true
      stepByStepSlow = false
    }
  }

  class SimulateAsapButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 120, 230, 40)
      p5.fill(0)
      p5.text('Do 1 gen ASAP.', 770, 150)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(760, 120, 230, 40)
    }

    onClick(): void {
      gensToDo = 1
      startASAP()
    }
  }

  class SimulateAlapButton extends Widget {
    draw(): void {
      p5.noStroke()

      if (gensToDo >= 2) {
        p5.fill(128, 255, 128)
      } else {
        p5.fill(70, 140, 70)
      }

      p5.rect(990, 120, 230, 40)
      p5.fill(0)
      p5.text('Do gens ALAP.', 1000, 150)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(990, 120, 230, 40)
    }

    onClick(): void {
      gensToDo = 1000000000
      startASAP()
    }
  }

  class StepByStepSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, windowHeight - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(0, windowHeight - 40, 90, 40)
    }

    onClick(): void {
      for (let s = appState.viewTimer; s < 900; s++) {
        advanceSimulation()
      }

      appState.viewTimer = 1021
    }
  }

  class StepByStepPlaybackSpeedButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(120, windowHeight - 40, 240, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('PB speed: x' + simulationState.speed, 240, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(120, windowHeight - 40, 240, 40)
    }

    onClick(): void {
      simulationState.speed *= 2

      if (simulationState.speed === 1024) {
        simulationState.speed = 900
      }

      if (simulationState.speed >= 1800) {
        simulationState.speed = 1
      }
    }
  }

  class StepByStepFinishButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(windowWidth - 120, windowHeight - 40, 120, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('FINISH', windowWidth - 60, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(windowWidth - 120, windowHeight - 40, 120, 40)
    }

    onClick(): void {
      for (let s = appState.viewTimer; s < 900; s++) {
        advanceSimulation()
      }

      appState.viewTimer = 0
      creaturesTested++

      for (let i = creaturesTested; i < CREATURE_COUNT; i++) {
        setSimulationState(creaturesInLatestGeneration[i])

        for (let s = 0; s < 900; s++) {
          advanceSimulation()
        }

        setFitnessOfSimulationCreature()
      }

      setActivity(Activity.SimulationFinished)
    }
  }

  class SortCreaturesButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(900, 664, 260, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text('Sort', windowWidth - 250, 690)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      setActivity(Activity.SortingCreatures)
    }
  }

  class SortingCreaturesSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, windowHeight - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(0, windowHeight - 40, 90, 40)
    }

    onClick(): void {
      appState.viewTimer = 100000
    }
  }

  class CullCreaturesButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(900, 670, 260, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text(
        `Kill ${Math.floor(CREATURE_COUNT / 2)}`,
        windowWidth - 250,
        700
      )
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(900, 670, 260, 40)
    }

    onClick(): void {
      setActivity(Activity.CullingCreatures)
    }
  }

  class PropagateCreaturesButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(1050, 670, 160, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text('Reproduce', windowWidth - 150, 700)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      setActivity(Activity.PropagatingCreatures)
    }
  }

  class PropagatedCreaturesBackButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(1050, 670, 160, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text('Back', windowWidth - 150, 700)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      setActivity(Activity.GenerationView)
    }
  }

  class GenerationSlider extends Widget {
    draw(): void {
      p5.noStroke()
      p5.textAlign(p5.CENTER)
      p5.fill(100)
      p5.rect(760, 340, 460, 50)
      p5.fill(220)
      p5.rect(sliderX, 340, 50, 50)

      let fs = 0
      if (selectedGeneration >= 1) {
        fs = Math.floor(Math.log(selectedGeneration) / Math.log(10))
      }

      const fontSize = FONT_SIZES[fs]

      p5.textFont(font, fontSize)
      p5.fill(0)
      p5.text(selectedGeneration, sliderX + 25, 366 + fontSize * 0.3333)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(sliderX, 340, 50, 50)
    }

    onDrag(): void {
      const {mX} = getCursorPosition()
      sliderX = Math.min(
        Math.max(sliderX + (mX - 25 - sliderX) * 0.2, 760),
        1170
      )
    }
  }

  class StatusWindowView extends Widget {
    draw(): void {
      let x, y, px, py
      let rank = statusWindow + 1

      let cj

      p5.stroke(Math.abs((p5.frameCount % 30) - 15) * 17) // oscillate between 0–255
      p5.strokeWeight(3)
      p5.noFill()

      if (statusWindow >= 0) {
        cj = c2[statusWindow]

        if (appState.currentActivityId === Activity.FinishedStepByStep) {
          const id = (cj.id - 1) % CREATURE_COUNT
          x = id % 40
          y = Math.floor(id / 40)
        } else {
          x = statusWindow % 40
          y = Math.floor(statusWindow / 40) + 1
        }

        px = x * 30 + 55
        py = y * 25 + 10

        if (px <= 1140) {
          px += 80
        } else {
          px -= 80
        }

        p5.rect(x * 30 + 40, y * 25 + 17, 30, 25)
      } else {
        const historyEntry = appState.generationHistoryMap[selectedGeneration]
        cj = historyEntry[historyEntryKeyForStatusWindow(statusWindow)]

        x = 760 + (statusWindow + 3) * 160
        y = 180
        px = x
        py = y
        p5.rect(x, y, 140, 140)

        const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
        rank = ranks[statusWindow + 3]
      }

      p5.noStroke()
      p5.fill(255)
      p5.rect(px - 60, py, 120, 52)
      p5.fill(0)
      p5.textFont(font, 12)
      p5.textAlign(p5.CENTER)
      p5.text('#' + rank, px, py + 12)
      p5.text('ID: ' + cj.id, px, py + 24)
      p5.text('Fitness: ' + p5.nf(cj.fitness, 0, 3), px, py + 36)
      p5.colorMode(p5.HSB, 1)

      const sp = (cj.nodes.length % 10) * 10 + (cj.muscles.length % 10)
      p5.fill(getColor(sp, true))
      p5.text(
        'Species: S' + (cj.nodes.length % 10) + '' + (cj.muscles.length % 10),
        px,
        py + 48
      )
      p5.colorMode(p5.RGB, 255)

      if (appState.showPopupSimulation) {
        this.drawPopupSimulation(px, py)
      }
    }

    private drawPopupSimulation(px: number, py: number): void {
      let py2 = py - 125
      if (py >= 360) {
        py2 -= 180
      } else {
        py2 += 180
      }

      const px2 = Math.min(Math.max(px - 90, 10), 970)

      simulationState.camera.zoom = 0.009

      const {averageX, averageY} = getNodesAverage(
        simulationState.creature.nodes
      )
      simulationState.camera.x += (averageX - simulationState.camera.x) * 0.1
      simulationState.camera.y += (averageY - simulationState.camera.y) * 0.1

      popUpImage.push()
      popUpImage.translate(225, 225)
      popUpImage.scale(1.0 / simulationState.camera.zoom / scaleToFixBug)
      popUpImage.translate(
        -simulationState.camera.x * scaleToFixBug,
        -simulationState.camera.y * scaleToFixBug
      )

      if (simulationState.timer < 900) {
        popUpImage.background(120, 200, 255)
      } else {
        popUpImage.background(60, 100, 128)
      }

      drawPosts(2)
      drawGround(2)
      drawCreaturePieces(
        simulationState.creature.nodes,
        simulationState.creature.muscles,
        0,
        0,
        2
      )

      popUpImage.noStroke()
      popUpImage.pop()

      p5.image(popUpImage, px2, py2, 300, 300)

      drawStats(px2 + 295, py2, 0.45)
      advanceSimulation()
    }
  }

  const startViewStartButton = new StartViewStartButton()
  const generationViewCreateButton = new GenerationViewCreateButton()
  const generatedCreaturesBackButton = new GeneratedCreaturesBackButton()
  const simulateStepByStepButton = new SimulateStepByStepButton()
  const simulateQuickButton = new SimulateQuickButton()
  const simulateAsapButton = new SimulateAsapButton()
  const simulateAlapButton = new SimulateAlapButton()
  const generationSlider = new GenerationSlider()
  const stepByStepSkipButton = new StepByStepSkipButton()
  const stepByStepPlaybackSpeedButton = new StepByStepPlaybackSpeedButton()
  const stepByStepFinishButton = new StepByStepFinishButton()
  const sortCreaturesButton = new SortCreaturesButton()
  const sortingCreaturesSkipButton = new SortingCreaturesSkipButton()
  const cullCreaturesButton = new CullCreaturesButton()
  const propagateCreaturesButton = new PropagateCreaturesButton()
  const propagatedCreaturesBackButton = new PropagatedCreaturesBackButton()
  const statusWindowView = new StatusWindowView()

  function drawGround(toImage: number): void {
    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)

    const stairDrawStart = Math.max(
      1,
      toInt(-averageY / simulationConfig.hazelStairs) - 10
    )

    if (toImage == 0) {
      p5.noStroke()
      p5.fill(0, 130, 0)
      p5.rect(
        (simulationState.camera.x - simulationState.camera.zoom * 800.0) *
          scaleToFixBug,
        0 * scaleToFixBug,
        simulationState.camera.zoom * 1600.0 * scaleToFixBug,
        simulationState.camera.zoom * 900.0 * scaleToFixBug
      )

      if (simulationConfig.hazelStairs > 0) {
        for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
          p5.fill(255, 255, 255, 128)
          p5.rect(
            (averageX - 20) * scaleToFixBug,
            -simulationConfig.hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            simulationConfig.hazelStairs * 0.3 * scaleToFixBug
          )
          p5.fill(255, 255, 255, 255)
          p5.rect(
            (averageX - 20) * scaleToFixBug,
            -simulationConfig.hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            simulationConfig.hazelStairs * 0.15 * scaleToFixBug
          )
        }
      }
    } else if (toImage == 2) {
      popUpImage.noStroke()
      popUpImage.fill(0, 130, 0)
      popUpImage.rect(
        (simulationState.camera.x - simulationState.camera.zoom * 300.0) *
          scaleToFixBug,
        0 * scaleToFixBug,
        simulationState.camera.zoom * 600.0 * scaleToFixBug,
        simulationState.camera.zoom * 600.0 * scaleToFixBug
      )

      if (simulationConfig.hazelStairs > 0) {
        for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
          popUpImage.fill(255, 255, 255, 128)
          popUpImage.rect(
            (averageX - 20) * scaleToFixBug,
            -simulationConfig.hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            simulationConfig.hazelStairs * 0.3 * scaleToFixBug
          )
          popUpImage.fill(255, 255, 255, 255)
          popUpImage.rect(
            (averageX - 20) * scaleToFixBug,
            -simulationConfig.hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            simulationConfig.hazelStairs * 0.15 * scaleToFixBug
          )
        }
      }
    }
  }

  function drawNode(node: Node, x: number, y: number, toImage: number): void {
    let color = p5.color(512 - toInt(node.friction * 512), 0, 0)

    if (node.friction <= 0.5) {
      color = p5.color(
        255,
        255 - toInt(node.friction * 512),
        255 - toInt(node.friction * 512)
      )
    }

    const graphics = [p5, screenImage, popUpImage][toImage]

    graphics.fill(color)
    graphics.noStroke()
    graphics.ellipse(
      (node.positionX + x) * scaleToFixBug,
      (node.positionY + y) * scaleToFixBug,
      node.mass * scaleToFixBug,
      node.mass * scaleToFixBug
    )

    if (node.friction >= 0.5) {
      graphics.fill(255)
    } else {
      graphics.fill(0)
    }

    graphics.textAlign(p5.CENTER)
    graphics.textFont(font, 0.4 * node.mass * scaleToFixBug)
    graphics.text(
      p5.nf(node.value, 0, 2),
      (node.positionX + x) * scaleToFixBug,
      (node.positionY + node.mass * NODE_TEXT_LINE_MULTIPLIER_Y2 + y) *
        scaleToFixBug
    )
    graphics.text(
      NODE_OPERATION_LABELS_BY_ID[node.operation],
      (node.positionX + x) * scaleToFixBug,
      (node.positionY + node.mass * NODE_TEXT_LINE_MULTIPLIER_Y1 + y) *
        scaleToFixBug
    )
  }

  function drawNodeAxons(
    nodes: Node[],
    nodeIndex: number,
    x: number,
    y: number,
    toImage: number
  ): void {
    const node = nodes[nodeIndex]

    if (AXON_COUNT_BY_NODE_OPERATION_ID[node.operation] >= 1) {
      const axonSource = nodes[nodes[nodeIndex].axon1]
      const point1x = node.positionX - node.mass * 0.3 + x
      const point1y = node.positionY - node.mass * 0.3 + y
      const point2x = axonSource.positionX + x
      const point2y = axonSource.positionY + axonSource.mass * 0.5 + y

      drawSingleAxon(point1x, point1y, point2x, point2y, toImage)
    }

    if (AXON_COUNT_BY_NODE_OPERATION_ID[node.operation] === 2) {
      const axonSource = nodes[nodes[nodeIndex].axon2]
      const point1x = node.positionX + node.mass * 0.3 + x
      const point1y = node.positionY - node.mass * 0.3 + y
      const point2x = axonSource.positionX + x
      const point2y = axonSource.positionY + axonSource.mass * 0.5 + y

      drawSingleAxon(point1x, point1y, point2x, point2y, toImage)
    }
  }

  function drawSingleAxon(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    toImage: number
  ): void {
    const arrowHeadSize = 0.1
    const angle = Math.atan2(y2 - y1, x2 - x1)

    const graphics = [p5, screenImage, popUpImage][toImage]

    graphics.stroke(AXON_COLOR)
    graphics.strokeWeight(0.03 * scaleToFixBug)
    graphics.line(
      x1 * scaleToFixBug,
      y1 * scaleToFixBug,
      x2 * scaleToFixBug,
      y2 * scaleToFixBug
    )
    graphics.line(
      x1 * scaleToFixBug,
      y1 * scaleToFixBug,
      (x1 + Math.cos(angle + Math.PI * 0.25) * arrowHeadSize) * scaleToFixBug,
      (y1 + Math.sin(angle + Math.PI * 0.25) * arrowHeadSize) * scaleToFixBug
    )
    graphics.line(
      x1 * scaleToFixBug,
      y1 * scaleToFixBug,
      (x1 + Math.cos(angle + Math.PI * 1.75) * arrowHeadSize) * scaleToFixBug,
      (y1 + Math.sin(angle + Math.PI * 1.75) * arrowHeadSize) * scaleToFixBug
    )
    graphics.noStroke()
  }

  function drawMuscle(
    muscle: Muscle,
    nodes: Node[],
    x: number,
    y: number,
    toImage: number
  ): void {
    const ni1 = nodes[muscle.nodeConnection1]
    const ni2 = nodes[muscle.nodeConnection2]

    let w = 0.15

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      w = nodes[muscle.axon].getClampedValue() * 0.15
    }

    const graphics = [p5, screenImage, popUpImage][toImage]

    graphics.strokeWeight(w * scaleToFixBug)
    graphics.stroke(70, 35, 0, muscle.rigidity * 3000)
    graphics.line(
      (ni1.positionX + x) * scaleToFixBug,
      (ni1.positionY + y) * scaleToFixBug,
      (ni2.positionX + x) * scaleToFixBug,
      (ni2.positionY + y) * scaleToFixBug
    )
  }

  function drawMuscleAxons(
    muscle: Muscle,
    nodes: Node[],
    x: number,
    y: number,
    toImage: number
  ): void {
    const connectedNode1 = nodes[muscle.nodeConnection1]
    const connectedNode2 = nodes[muscle.nodeConnection2]

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      const axonSource = nodes[muscle.axon]
      const muscleMidX =
        (connectedNode1.positionX + connectedNode2.positionX) * 0.5 + x
      const muscleMidY =
        (connectedNode1.positionY + connectedNode2.positionY) * 0.5 + y

      drawSingleAxon(
        muscleMidX,
        muscleMidY,
        axonSource.positionX + x,
        axonSource.positionY + axonSource.mass * 0.5 + y,
        toImage
      )

      const averageMass = (connectedNode1.mass + connectedNode2.mass) * 0.5
      const graphics = [p5, screenImage, popUpImage][toImage]

      graphics.fill(AXON_COLOR)
      graphics.textAlign(p5.CENTER)
      graphics.textFont(font, 0.4 * averageMass * scaleToFixBug)
      graphics.text(
        p5.nf(nodes[muscle.axon].getClampedValue(), 0, 2),
        muscleMidX * scaleToFixBug,
        muscleMidY * scaleToFixBug
      )
    }
  }

  function drawPosts(toImage: number): void {
    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)
    const startPostY = Math.min(-8, toInt(averageY / 4) * 4 - 4)

    const graphics = [p5, null, popUpImage][toImage]

    if (graphics == null) {
      return
    }

    graphics.textAlign(p5.CENTER)
    graphics.textFont(font, postFontSize * scaleToFixBug)
    graphics.noStroke()

    for (let postY = startPostY; postY <= startPostY + 8; postY += 4) {
      for (let i = toInt(averageX / 5 - 5); i <= toInt(averageX / 5 + 5); i++) {
        graphics.fill(255)
        graphics.rect(
          (i * 5 - 0.1) * scaleToFixBug,
          (-3.0 + postY) * scaleToFixBug,
          0.2 * scaleToFixBug,
          3 * scaleToFixBug
        )
        graphics.rect(
          (i * 5 - 1) * scaleToFixBug,
          (-3.0 + postY) * scaleToFixBug,
          2 * scaleToFixBug,
          1 * scaleToFixBug
        )
        graphics.fill(120)
        graphics.text(
          i + ' m',
          i * 5 * scaleToFixBug,
          (-2.17 + postY) * scaleToFixBug
        )
      }
    }
  }

  function drawArrow(x: number): void {
    p5.textAlign(p5.CENTER)
    p5.textFont(font, postFontSize * scaleToFixBug)
    p5.noStroke()
    p5.fill(120, 0, 255)
    p5.rect(
      (x - 1.7) * scaleToFixBug,
      -4.8 * scaleToFixBug,
      3.4 * scaleToFixBug,
      1.1 * scaleToFixBug
    )
    p5.beginShape()
    p5.vertex(x * scaleToFixBug, -3.2 * scaleToFixBug)
    p5.vertex((x - 0.5) * scaleToFixBug, -3.7 * scaleToFixBug)
    p5.vertex((x + 0.5) * scaleToFixBug, -3.7 * scaleToFixBug)
    p5.endShape(p5.CLOSE)
    p5.fill(255)
    p5.text(
      Math.round(x * 2) / 10 + ' m',
      x * scaleToFixBug,
      -3.91 * scaleToFixBug
    )
  }

  function drawGraphImage(): void {
    p5.image(graphImage, 50, 180, 650, 380)
    p5.image(segBarImage, 50, 580, 650, 100)

    if (generationCount >= 1) {
      p5.stroke(0, 160, 0, 255)
      p5.strokeWeight(3)

      const genWidth = 590.0 / generationCount
      const lineX = 110 + selectedGeneration * genWidth

      p5.line(lineX, 180, lineX, 500 + 180)

      p5.textAlign(p5.LEFT)
      p5.textFont(font, 12)
      p5.noStroke()

      const speciesCounts =
        appState.speciesCountsHistoryMap[selectedGeneration] || []

      // Identify the largest species count.
      const highCount = speciesCounts.reduce(
        (max, entry) => Math.max(max, entry.count),
        0
      )

      const minCountToBeLabeled = 25
      const yOffset = 573

      let cumulativeStart = 0

      speciesCounts.forEach(({speciesId, count}) => {
        if (count >= minCountToBeLabeled) {
          // When this species has a count of at least 25, label it on the graph.

          // Set the starting y position for this species' label.
          const y = Math.floor(
            ((cumulativeStart + count / 2) / CREATURE_COUNT) * 100 + yOffset
          )

          if (count === highCount) {
            /*
             * When the count for this species matches the largest count, add
             * emphasis to its style.
             */

            p5.stroke(0)
            p5.strokeWeight(2)
          } else {
            p5.noStroke()
          }

          p5.fill(255, 255, 255)
          p5.rect(lineX + 3, y, 56, 14)
          p5.colorMode(p5.HSB, 1.0)
          p5.fill(getColor(speciesId, true))
          // Example label: "S45: 207"
          p5.text(`S${speciesId}: ${count}`, lineX + 5, y + 11)
          p5.colorMode(p5.RGB, 255)
        }

        cumulativeStart += count
      })

      p5.noStroke()
    }
  }

  function getColor(i: number, adjust: boolean): Color {
    p5.colorMode(p5.HSB, 1.0)

    let col = (i * 1.618034) % 1
    if (i == 46) {
      col = 0.083333
    }

    let light = 1.0
    if (Math.abs(col - 0.333) <= 0.18 && adjust) {
      light = 0.7
    }

    return p5.color(col, 1.0, light)
  }

  function drawGraph(graphWidth: number, graphHeight: number): void {
    graphImage.background(220)

    if (generationCount >= 1) {
      drawLines(
        90,
        toInt(graphHeight * 0.05),
        graphWidth - 90,
        toInt(graphHeight * 0.9)
      )
      drawSegBars(90, 0, graphWidth - 90, 150)
    }
  }

  function drawLines(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    const gh = graphHeight
    const genWidth = graphWidth / generationCount
    const best = extreme(1)
    const worst = extreme(-1)
    const meterHeight = graphHeight / (best - worst)
    const zero = (best / (best - worst)) * gh
    const unit = setUnit(best, worst)

    graphImage.stroke(150)
    graphImage.strokeWeight(2)
    graphImage.fill(150)
    graphImage.textFont(font, 18)
    graphImage.textAlign(p5.RIGHT)

    for (
      let i = Math.ceil((worst - (best - worst) / 18.0) / unit) * unit;
      i < best + (best - worst) / 18.0;
      i += unit
    ) {
      const lineY = y - i * meterHeight + zero
      graphImage.line(x, lineY, graphWidth + x, lineY)
      graphImage.text(
        showUnit(i, unit) + ' ' + FITNESS_UNIT_LABEL,
        x - 5,
        lineY + 4
      )
    }

    graphImage.stroke(0)

    for (let i = 0; i < fitnessPercentileCount; i++) {
      let k

      if (i == 28) {
        k = 14
      } else if (i < 14) {
        k = i
      } else {
        k = i + 1
      }

      if (k == 14) {
        graphImage.stroke(255, 0, 0, 255)
        graphImage.strokeWeight(5)
      } else {
        p5.stroke(0)

        if (k == 0 || k == 28 || (k >= 10 && k <= 18)) {
          graphImage.strokeWeight(3)
        } else {
          graphImage.strokeWeight(1)
        }
      }

      for (let j = 0; j < generationCount; j++) {
        graphImage.line(
          x + j * genWidth,
          -fitnessPercentileHistory[j][k] * meterHeight + zero + y,
          x + (j + 1) * genWidth,
          -fitnessPercentileHistory[j + 1][k] * meterHeight + zero + y
        )
      }
    }
  }

  function drawSegBars(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    segBarImage.noStroke()
    segBarImage.colorMode(p5.HSB, 1)
    segBarImage.background(0, 0, 0.5)

    const generationWidth = graphWidth / generationCount
    const generationsPerBar = Math.floor(generationCount / 500) + 1

    for (let i1 = 0; i1 < generationCount; i1 += generationsPerBar) {
      const i2 = Math.min(i1 + generationsPerBar, generationCount)

      const barX1 = x + i1 * generationWidth
      const barX2 = x + i2 * generationWidth

      /*
       * The initial index `i1` of `0` does not correspond to a generation, so
       * fall back to an empty species counts history entry.
       */
      const speciesCounts1 = appState.speciesCountsHistoryMap[i1] || []
      const speciesCounts2 = appState.speciesCountsHistoryMap[i2]

      /*
       * Joined entries will include a count for all species represented between
       * both generations, using a count of `0` where a species has no count in
       * the given generation.
       */
      const joinedEntries = []

      let countIndex1 = 0
      let countIndex2 = 0

      while (
        countIndex1 < speciesCounts1.length ||
        countIndex2 < speciesCounts2.length
      ) {
        const entry1 = speciesCounts1[countIndex1]
        const entry2 = speciesCounts2[countIndex2]

        if (entry1?.speciesId === entry2?.speciesId) {
          joinedEntries.push({
            speciesId: entry1.speciesId,
            countStart: entry1.count,
            countEnd: entry2.count
          })

          countIndex1++
          countIndex2++
        } else if (entry2 == null || entry1?.speciesId < entry2.speciesId) {
          joinedEntries.push({
            speciesId: entry1.speciesId,
            countStart: entry1.count,
            countEnd: 0
          })

          countIndex1++
        } else {
          joinedEntries.push({
            speciesId: entry2.speciesId,
            countStart: 0,
            countEnd: entry2.count
          })

          countIndex2++
        }
      }

      let cumulativeStart = 0
      let cumulativeEnd = 0

      if (speciesCounts1.length === 0) {
        // Start all graph areas from the middle of the range.
        cumulativeStart = Math.floor(CREATURE_COUNT / 2)
      }

      joinedEntries.forEach(({speciesId, countStart, countEnd}) => {
        segBarImage.fill(getColor(speciesId, false))
        segBarImage.beginShape()

        // top-left and top-right
        const start1 = cumulativeStart / CREATURE_COUNT
        const end1 = cumulativeEnd / CREATURE_COUNT

        // Accumulate the counts for the next species' offset.
        cumulativeStart += countStart
        cumulativeEnd += countEnd

        // bottom-left and bottom-right
        const start2 = cumulativeStart / CREATURE_COUNT
        const end2 = cumulativeEnd / CREATURE_COUNT

        // Draw quadrilateral, counter-clockwise.
        segBarImage.vertex(barX1, y + start1 * graphHeight)
        segBarImage.vertex(barX1, y + start2 * graphHeight)
        segBarImage.vertex(barX2, y + end2 * graphHeight)
        segBarImage.vertex(barX2, y + end1 * graphHeight)

        segBarImage.endShape()
      })
    }

    p5.colorMode(p5.RGB, 255)
  }

  function extreme(sign: number): number {
    let record = -sign

    for (let i = 0; i < generationCount; i++) {
      const toTest = fitnessPercentileHistory[i + 1][toInt(14 - sign * 14)]

      if (toTest * sign > record * sign) {
        record = toTest
      }
    }

    return record
  }

  function setUnit(best: number, worst: number): number {
    const unit2 = (3 * Math.log(best - worst)) / Math.log(10) - 2

    if ((unit2 + 90) % 3 < 1) {
      return Math.pow(10, Math.floor(unit2 / 3))
    }

    if ((unit2 + 90) % 3 < 2) {
      return Math.pow(10, Math.floor((unit2 - 1) / 3)) * 2
    }

    return Math.pow(10, Math.floor((unit2 - 2) / 3)) * 5
  }

  function showUnit(i: number, unit: number): String {
    if (unit < 1) {
      return p5.nf(i, 0, 2) + ''
    }

    return toInt(i) + ''
  }

  function getNodesAverage(nodes: Node[]): {
    averageX: number
    averageY: number
  } {
    let averageX = 0
    let averageY = 0

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      averageX += node.positionX
      averageY += node.positionY
    }

    averageX = averageX / nodes.length
    averageY = averageY / nodes.length

    return {averageX, averageY}
  }

  p5.mouseWheel = (event: WheelEvent) => {
    const delta = event.deltaX

    if (appState.currentActivityId === Activity.SimulationRunning) {
      if (delta < 0) {
        simulationState.camera.zoom *= 0.9090909

        if (simulationState.camera.zoom < 0.002) {
          simulationState.camera.zoom = 0.002
        }

        p5.textFont(font, postFontSize)
      } else if (delta > 0) {
        simulationState.camera.zoom *= 1.1

        if (simulationState.camera.zoom > 0.1) {
          simulationState.camera.zoom = 0.1
        }

        p5.textFont(font, postFontSize)
      }
    }
  }

  p5.mousePressed = () => {
    if (gensToDo >= 1) {
      gensToDo = 0
    }

    if (
      appState.currentActivityId === Activity.GenerationView &&
      generationCount >= 1 &&
      generationSlider.isUnderCursor()
    ) {
      draggingSlider = true
    }
  }

  function setActivity(m: Activity): void {
    appState.currentActivityId = m

    if (m === Activity.GenerationView) {
      drawGraph(975, 570)
    }
  }

  function startASAP(): void {
    setActivity(Activity.RequestingSimulation)
    creaturesTested = 0
    stepByStep = false
    stepByStepSlow = false
  }

  p5.mouseReleased = () => {
    draggingSlider = false
    // When the popup simulation is running, mouse clicks will stop it.
    appState.showPopupSimulation = false

    if (
      appState.currentActivityId === Activity.Start &&
      startViewStartButton.isUnderCursor()
    ) {
      startViewStartButton.onClick()
    } else if (
      appState.currentActivityId === Activity.GenerationView &&
      generationCount == -1 &&
      generationViewCreateButton.isUnderCursor()
    ) {
      generationViewCreateButton.onClick()
    } else if (
      appState.currentActivityId === Activity.GenerationView &&
      generationCount >= 0
    ) {
      if (simulateStepByStepButton.isUnderCursor()) {
        simulateStepByStepButton.onClick()
      } else if (simulateQuickButton.isUnderCursor()) {
        simulateQuickButton.onClick()
      } else if (simulateAsapButton.isUnderCursor()) {
        simulateAsapButton.onClick()
      } else if (simulateAlapButton.isUnderCursor()) {
        simulateAlapButton.onClick()
      }
    } else if (
      appState.currentActivityId === Activity.GeneratedCreatures &&
      generatedCreaturesBackButton.isUnderCursor()
    ) {
      generatedCreaturesBackButton.onClick()
    } else if (
      appState.currentActivityId === Activity.FinishedStepByStep &&
      sortCreaturesButton.isUnderCursor()
    ) {
      sortCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === Activity.SimulationRunning ||
      appState.currentActivityId === Activity.RequestingSimulation
    ) {
      if (stepByStepSkipButton.isUnderCursor()) {
        stepByStepSkipButton.onClick()
      } else if (stepByStepPlaybackSpeedButton.isUnderCursor()) {
        stepByStepPlaybackSpeedButton.onClick()
      } else if (stepByStepFinishButton.isUnderCursor()) {
        stepByStepFinishButton.onClick()
      }
    } else if (
      appState.currentActivityId === Activity.SortingCreatures &&
      sortingCreaturesSkipButton.isUnderCursor()
    ) {
      sortingCreaturesSkipButton.onClick()
    } else if (
      appState.currentActivityId === Activity.SortedCreatures &&
      cullCreaturesButton.isUnderCursor()
    ) {
      cullCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === Activity.CulledCreatures &&
      propagateCreaturesButton.isUnderCursor()
    ) {
      propagateCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === Activity.PropagatedCreatures &&
      propagatedCreaturesBackButton.isUnderCursor()
    ) {
      propagatedCreaturesBackButton.onClick()
    }
  }

  function drawScreenImage(creatureGridViewType: CreatureGridViewType): void {
    screenImage.push()
    screenImage.scale(15.0 / scaleToFixBug)
    screenImage.background(220, 253, 102)
    screenImage.noStroke()

    for (let i = 0; i < CREATURE_COUNT; i++) {
      let creature = c2[i]
      if (creatureGridViewType === CreatureGridViewType.PropagatedCreatures) {
        const index = indexOfCreatureInLatestGeneration(creature.id)
        creature = creaturesInLatestGeneration[index]
      }

      let gridIndex = i
      if (creatureGridViewType === CreatureGridViewType.SimulationFinished) {
        gridIndex = (creature.id - 1) % CREATURE_COUNT
        creatureIdsByGridIndex[gridIndex] = i
      }

      const gridX = gridIndex % 40
      let gridY = Math.floor(gridIndex / 40)

      if (creatureGridViewType !== CreatureGridViewType.SimulationFinished) {
        gridY++
      }

      drawCreature(creature, gridX * 3 + 5.5, gridY * 2.5 + 4, 1)
    }

    appState.viewTimer = 0
    screenImage.pop()
    screenImage.push()
    screenImage.scale(1.5)

    screenImage.textAlign(p5.CENTER)
    screenImage.textFont(font, 24)
    screenImage.fill(100, 100, 200)
    screenImage.noStroke()

    if (creatureGridViewType === CreatureGridViewType.SimulationFinished) {
      screenImage.fill(0)
      screenImage.text(
        "All 1,000 creatures have been tested.  Now let's sort them!",
        windowWidth / 2 - 200,
        690
      )
      sortCreaturesButton.draw()
    } else if (creatureGridViewType === CreatureGridViewType.SortedCreatures) {
      screenImage.fill(0)
      screenImage.text('Fastest creatures at the top!', windowWidth / 2, 30)
      screenImage.text(
        'Slowest creatures at the bottom. (Going backward = slow)',
        windowWidth / 2 - 200,
        700
      )
      cullCreaturesButton.draw()
    } else if (creatureGridViewType === CreatureGridViewType.CulledCreatures) {
      screenImage.fill(0)
      screenImage.text(
        'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
        windowWidth / 2,
        30
      )
      screenImage.text(
        'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
        windowWidth / 2 - 130,
        700
      )
      propagateCreaturesButton.draw()

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        const x = j % 40
        const y = Math.floor(j / 40) + 1

        if (cj.alive) {
          drawCreature(cj, x * 30 + 55, y * 25 + 40, 0)
        } else {
          screenImage.rect(x * 30 + 40, y * 25 + 17, 30, 25)
        }
      }
    } else if (
      creatureGridViewType === CreatureGridViewType.PropagatedCreatures
    ) {
      screenImage.fill(0)
      screenImage.text(
        'These are the 1000 creatures of generation #' +
          (generationCount + 2) +
          '.',
        windowWidth / 2,
        30
      )
      screenImage.text(
        'What perils will they face?  Find out next time!',
        windowWidth / 2 - 130,
        700
      )
      propagatedCreaturesBackButton.draw()
    }

    screenImage.pop()
  }

  function drawCreature(
    creature: Creature,
    x: number,
    y: number,
    toImage: number
  ): void {
    drawCreaturePieces(creature.nodes, creature.muscles, x, y, toImage)
  }

  function drawCreaturePieces(
    nodes: Node[],
    muscles: Muscle[],
    x: number,
    y: number,
    toImage: number
  ): void {
    for (let i = 0; i < muscles.length; i++) {
      drawMuscle(muscles[i], nodes, x, y, toImage)
    }
    for (let i = 0; i < nodes.length; i++) {
      drawNode(nodes[i], x, y, toImage)
    }
    for (let i = 0; i < muscles.length; i++) {
      drawMuscleAxons(muscles[i], nodes, x, y, toImage)
    }
    for (let i = 0; i < nodes.length; i++) {
      drawNodeAxons(nodes, i, x, y, toImage)
    }
  }

  function drawHistogram(x: number, y: number, hw: number, hh: number): void {
    let maxH = 1

    for (let i = 0; i < barLen; i++) {
      if (barCounts[selectedGeneration][i] > maxH) {
        maxH = barCounts[selectedGeneration][i]
      }
    }

    p5.fill(200)
    p5.noStroke()
    p5.rect(x, y, hw, hh)
    p5.fill(0, 0, 0)

    const barW = hw / barLen
    const multiplier = (hh / maxH) * 0.9

    p5.textAlign(p5.LEFT)
    p5.textFont(font, 16)
    p5.stroke(128)
    p5.strokeWeight(2)

    let unit = 100

    if (maxH < 300) {
      unit = 50
    }

    if (maxH < 100) {
      unit = 20
    }

    if (maxH < 50) {
      unit = 10
    }

    for (let i = 0; i < hh / multiplier; i += unit) {
      let theY = y + hh - i * multiplier

      p5.line(x, theY, x + hw, theY)

      if (i == 0) {
        theY -= 5
      }

      p5.text(i, x + hw + 5, theY + 7)
    }

    p5.textAlign(p5.CENTER)

    for (let i = minBar; i <= maxBar; i += 10) {
      if (i == 0) {
        p5.stroke(0, 0, 255)
      } else {
        p5.stroke(128)
      }

      const theX = x + (i - minBar) * barW

      p5.text(p5.nf(i / histBarsPerMeter, 0, 1), theX, y + hh + 14)
      p5.line(theX, y, theX, y + hh)
    }

    p5.noStroke()

    for (let i = 0; i < barLen; i++) {
      const h = Math.min(barCounts[selectedGeneration][i] * multiplier, hh)

      if (
        i + minBar ==
        Math.floor(
          fitnessPercentileHistory[
            Math.min(selectedGeneration, fitnessPercentileHistory.length - 1)
          ][14] * histBarsPerMeter
        )
      ) {
        p5.fill(255, 0, 0)
      } else {
        p5.fill(0, 0, 0)
      }

      p5.rect(x + i * barW, y + hh - h, barW, h)
    }
  }

  p5.preload = () => {
    font = p5.loadFont('/fonts/Helvetica-Bold.otf')
  }

  p5.setup = () => {
    p5.frameRate(FRAME_RATE)
    p5.randomSeed(SEED)
    // Create a 1024x576 Canvas
    p5.createCanvas(
      windowWidth * WINDOW_SIZE_MULTIPLIER,
      windowHeight * WINDOW_SIZE_MULTIPLIER
    )
    p5.ellipseMode(p5.CENTER)

    fitnessPercentileHistory.push(new Array(fitnessPercentileCount).fill(0.0))
    barCounts.push(new Array(barLen).fill(0))

    graphImage = p5.createGraphics(975, 570)
    screenImage = p5.createGraphics(1920, 1080)
    popUpImage = p5.createGraphics(450, 450)
    segBarImage = p5.createGraphics(975, 150)

    segBarImage.background(220)
    popUpImage.background(220)

    p5.textFont(font, 96)
    p5.textAlign(p5.CENTER)
  }

  p5.draw = () => {
    p5.scale(WINDOW_SIZE_MULTIPLIER)

    if (appState.currentActivityId === Activity.Start) {
      p5.background(255)
      p5.noStroke()
      p5.fill(0)
      p5.text('EVOLUTION!', windowWidth / 2, 200)
      startViewStartButton.draw()
    } else if (appState.currentActivityId === Activity.GenerationView) {
      p5.noStroke()
      p5.fill(0)
      p5.background(255, 200, 130)
      p5.textFont(font, 32)
      p5.textAlign(p5.LEFT)
      p5.textFont(font, 96)
      p5.text('Generation ' + Math.max(selectedGeneration, 0), 20, 100)
      p5.textFont(font, 28)

      if (generationCount == -1) {
        p5.fill(0)
        p5.text(
          `Since there are no creatures yet, create ${CREATURE_COUNT} creatures!`,
          20,
          160
        )
        p5.text('They will be randomly created, and also very simple.', 20, 200)
        generationViewCreateButton.draw()
      } else {
        simulateStepByStepButton.draw()
        simulateQuickButton.draw()
        simulateAsapButton.draw()
        simulateAlapButton.draw()

        p5.fill(0)
        p5.text('Median ' + FITNESS_LABEL, 50, 160)
        p5.textAlign(p5.CENTER)
        p5.textAlign(p5.RIGHT)
        p5.text(
          Math.round(
            fitnessPercentileHistory[
              Math.min(selectedGeneration, fitnessPercentileHistory.length - 1)
            ][14] * 1000
          ) /
            1000 +
            ' ' +
            FITNESS_UNIT_LABEL,
          700,
          160
        )

        drawHistogram(760, 410, 460, 280)
        drawGraphImage()
      }

      if (gensToDo >= 1) {
        gensToDo--
        if (gensToDo >= 1) {
          startASAP()
        }
      }
    } else if (appState.currentActivityId === Activity.GeneratingCreatures) {
      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / scaleToFixBug)

      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 40; x++) {
          const index = y * 40 + x
          const creature = simulation.generateCreature(index + 1)

          creaturesInLatestGeneration[index] = creature

          drawCreature(creature, x * 3 + 5.5, y * 2.5 + 3, 0)
        }
      }

      setActivity(Activity.GeneratedCreatures)

      p5.pop()
      p5.noStroke()
      p5.fill(0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 24)
      p5.text(
        `Here are your ${CREATURE_COUNT} randomly generated creatures!!!`,
        windowWidth / 2 - 200,
        690
      )
      generatedCreaturesBackButton.draw()
    } else if (appState.currentActivityId === Activity.RequestingSimulation) {
      setSimulationState(creaturesInLatestGeneration[creaturesTested])
      simulationState.camera.zoom = 0.01

      setActivity(Activity.SimulationRunning)

      if (!stepByStepSlow) {
        for (let i = 0; i < CREATURE_COUNT; i++) {
          setSimulationState(creaturesInLatestGeneration[i])

          for (let s = 0; s < 900; s++) {
            advanceSimulation()
          }

          setFitnessOfSimulationCreature()
        }

        setActivity(Activity.SimulationFinished)
      }
    }

    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)

    if (appState.currentActivityId === Activity.SimulationRunning) {
      // simulate running

      if (appState.viewTimer <= 900) {
        p5.background(120, 200, 255)

        for (let s = 0; s < simulationState.speed; s++) {
          if (appState.viewTimer < 900) {
            advanceSimulation()
          }
        }

        if (simulationState.speed < 30) {
          for (let s = 0; s < simulationState.speed; s++) {
            simulationState.camera.x +=
              (averageX - simulationState.camera.x) * 0.06
            simulationState.camera.y +=
              (averageY - simulationState.camera.y) * 0.06
          }
        } else {
          simulationState.camera.x = averageX
          simulationState.camera.y = averageY
        }

        p5.push()

        p5.translate(p5.width / 2.0, p5.height / 2.0)
        p5.scale(1.0 / simulationState.camera.zoom / scaleToFixBug)
        p5.translate(
          -simulationState.camera.x * scaleToFixBug,
          -simulationState.camera.y * scaleToFixBug
        )

        drawPosts(0)
        drawGround(0)
        drawCreaturePieces(
          simulationState.creature.nodes,
          simulationState.creature.muscles,
          0,
          0,
          0
        )
        drawArrow(averageX)

        p5.pop()

        drawStats(windowWidth - 10, 0, 0.7)

        stepByStepSkipButton.draw()
        stepByStepPlaybackSpeedButton.draw()
        stepByStepFinishButton.draw()
      }

      if (appState.viewTimer == 900) {
        if (simulationState.speed < 30) {
          // When the simulation speed is slow enough, display the creature's fitness.
          p5.noStroke()
          p5.fill(0, 0, 0, 130)
          p5.rect(0, 0, windowWidth, windowHeight)
          p5.fill(0, 0, 0, 255)
          p5.rect(windowWidth / 2 - 500, 200, 1000, 240)
          p5.fill(255, 0, 0)
          p5.textAlign(p5.CENTER)
          p5.textFont(font, 96)
          p5.text("Creature's " + FITNESS_LABEL + ':', windowWidth / 2, 300)
          p5.text(
            p5.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
            windowWidth / 2,
            400
          )
        } else {
          // When the simulation speed is too fast, skip ahead to next simulation using the timer.
          appState.viewTimer = 1020
        }

        setFitnessOfSimulationCreature()
      }

      if (appState.viewTimer >= 1020) {
        setActivity(Activity.RequestingSimulation)

        creaturesTested++
        if (creaturesTested == CREATURE_COUNT) {
          setActivity(Activity.SimulationFinished)
        }

        simulationState.camera.x = 0
      }

      if (appState.viewTimer >= 900) {
        appState.viewTimer += simulationState.speed
      }
    }

    if (appState.currentActivityId === Activity.SimulationFinished) {
      // sort

      c2 = [...creaturesInLatestGeneration].sort(
        (creatureA, creatureB) => creatureB.fitness - creatureA.fitness
      )

      fitnessPercentileHistory.push(new Array<number>(fitnessPercentileCount))
      for (let i = 0; i < fitnessPercentileCount; i++) {
        fitnessPercentileHistory[generationCount + 1][i] =
          c2[fitnessPercentileCreatureIndices[i]].fitness
      }

      const historyEntry: GenerationHistoryEntry = {
        fastest: c2[0].clone(),
        median: c2[midCreatureIndex].clone(),
        slowest: c2[lastCreatureIndex].clone()
      }

      appState.generationHistoryMap[generationCount + 1] = historyEntry

      const beginBar = new Array<number>(barLen)
      for (let i = 0; i < barLen; i++) {
        beginBar[i] = 0
      }

      barCounts.push(beginBar)

      const speciesCountBySpeciesId: {[speciesId: number]: number} = {}

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const bar = Math.floor(c2[i].fitness * histBarsPerMeter - minBar)

        if (bar >= 0 && bar < barLen) {
          barCounts[generationCount + 1][bar]++
        }

        const speciesId = speciesIdForCreature(c2[i])
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

      appState.speciesCountsHistoryMap[generationCount + 1] = mapEntries

      if (stepByStep) {
        drawScreenImage(CreatureGridViewType.SimulationFinished)
        setActivity(Activity.FinishedStepByStep)
      } else {
        setActivity(Activity.CullingCreatures)
      }
    }

    if (appState.currentActivityId === Activity.SortingCreatures) {
      // cool sorting animation

      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / scaleToFixBug)

      const transition =
        0.5 - 0.5 * Math.cos(Math.min(appState.viewTimer / 60, Math.PI))

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        const j2 = cj.id - generationCount * CREATURE_COUNT - 1
        const x1 = j2 % 40
        const y1 = Math.floor(j2 / 40)
        const x2 = j % 40
        const y2 = Math.floor(j / 40) + 1
        const x3 = inter(x1, x2, transition)
        const y3 = inter(y1, y2, transition)

        drawCreature(cj, x3 * 3 + 5.5, y3 * 2.5 + 4, 0)
      }

      p5.pop()

      if (stepByStepSlow) {
        appState.viewTimer += 2
      } else {
        appState.viewTimer += 10
      }

      sortingCreaturesSkipButton.draw()

      if (appState.viewTimer > 60 * Math.PI) {
        drawScreenImage(CreatureGridViewType.SortedCreatures)
        setActivity(Activity.SortedCreatures)
      }
    }

    const {mX, mY} = getCursorPosition()

    if (
      (appState.currentActivityId === Activity.FinishedStepByStep ||
        appState.currentActivityId === Activity.SortingCreatures ||
        appState.currentActivityId === Activity.SortedCreatures ||
        appState.currentActivityId === Activity.CullingCreatures ||
        appState.currentActivityId === Activity.CulledCreatures) &&
      gensToDo == 0 &&
      !draggingSlider
    ) {
      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      let idOfCreatureUnderCursor: number | null = null

      if (Math.abs(mX - 639.5) <= 599.5) {
        if (
          appState.currentActivityId === Activity.FinishedStepByStep &&
          Math.abs(mY - 329) <= 312
        ) {
          idOfCreatureUnderCursor =
            creatureIdsByGridIndex[
              Math.floor((mX - 40) / 30) + Math.floor((mY - 17) / 25) * 40
            ]
        } else if (
          (appState.currentActivityId === Activity.SortedCreatures ||
            appState.currentActivityId === Activity.CullingCreatures ||
            appState.currentActivityId === Activity.CulledCreatures) &&
          Math.abs(mY - 354) <= 312
        ) {
          idOfCreatureUnderCursor =
            Math.floor((mX - 40) / 30) + Math.floor((mY - 42) / 25) * 40
        }
      }

      if (idOfCreatureUnderCursor != null) {
        setPopupSimulationCreatureId(idOfCreatureUnderCursor)
      } else {
        clearPopupSimulation()
      }
    } else if (
      appState.currentActivityId === Activity.GenerationView &&
      selectedGeneration >= 1 &&
      gensToDo == 0 &&
      !draggingSlider
    ) {
      /*
       * When the cursor is over the worst, median, or best creature, the popup
       * simulation will be displayed for that creature.
       */

      let worstMedianOrBest: number | null = null

      if (Math.abs(mY - 250) <= 70) {
        if (Math.abs(mX - 990) <= 230) {
          const modX = (mX - 760) % 160

          if (modX < 140) {
            worstMedianOrBest = Math.floor((mX - 760) / 160) - 3
          }
        }
      }

      if (worstMedianOrBest != null) {
        setPopupSimulationCreatureId(worstMedianOrBest)
      } else {
        clearPopupSimulation()
      }
    } else {
      clearPopupSimulation()
    }

    if (appState.currentActivityId === Activity.CullingCreatures) {
      // Cull Creatures

      for (let i = 0; i < 500; i++) {
        const fitnessRankSurvivalChance = i / CREATURE_COUNT
        const cullingThreshold = (Math.pow(p5.random(-1, 1), 3) + 1) / 2 // cube function

        let survivingCreatureIndex
        let culledCreatureIndex

        if (fitnessRankSurvivalChance <= cullingThreshold) {
          survivingCreatureIndex = i
          culledCreatureIndex = lastCreatureIndex - i
        } else {
          survivingCreatureIndex = lastCreatureIndex - i
          culledCreatureIndex = i
        }

        const survivingCreature = c2[survivingCreatureIndex]
        survivingCreature.alive = true

        const culledCreature = c2[culledCreatureIndex]
        culledCreature.alive = false
      }

      if (stepByStep) {
        drawScreenImage(CreatureGridViewType.CulledCreatures)
        setActivity(Activity.CulledCreatures)
      } else {
        setActivity(Activity.PropagatingCreatures)
      }
    }

    if (appState.currentActivityId === Activity.PropagatingCreatures) {
      // Reproduce and mutate

      for (let i = 0; i < 500; i++) {
        let survivingCreatureIndex
        let culledCreatureIndex

        if (c2[i].alive) {
          survivingCreatureIndex = i
          culledCreatureIndex = lastCreatureIndex - i
        } else {
          survivingCreatureIndex = lastCreatureIndex - i
          culledCreatureIndex = i
        }

        const survivingCreature = c2[survivingCreatureIndex]
        const culledCreature = c2[culledCreatureIndex]

        // Next generation includes a clone and mutated offspring
        c2[survivingCreatureIndex] = survivingCreature.clone(
          survivingCreature.id + CREATURE_COUNT
        )
        c2[culledCreatureIndex] = simulation.modifyCreature(
          survivingCreature,
          culledCreature.id + CREATURE_COUNT
        )

        // Stabilize and adjust mutated offspring
        const {muscles, nodes} = c2[culledCreatureIndex]

        simulation.stabilizeNodesAndMuscles(nodes, muscles)
        simulation.adjustNodesToCenter(nodes)
      }

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        const index = indexOfCreatureInLatestGeneration(cj.id)
        creaturesInLatestGeneration[index] = cj.clone()
      }

      drawScreenImage(CreatureGridViewType.PropagatedCreatures)

      generationCount++

      if (stepByStep) {
        setActivity(Activity.PropagatedCreatures)
      } else {
        setActivity(Activity.GenerationView)
      }
    }

    if (
      appState.currentActivityId === Activity.FinishedStepByStep ||
      appState.currentActivityId === Activity.SortedCreatures ||
      appState.currentActivityId === Activity.CulledCreatures ||
      appState.currentActivityId === Activity.PropagatedCreatures
    ) {
      p5.image(screenImage, 0, 0, windowWidth, windowHeight)
    }

    if (
      appState.currentActivityId === Activity.GenerationView ||
      gensToDo >= 1
    ) {
      p5.noStroke()

      if (generationCount >= 1) {
        if (generationCount >= 5) {
          selectedGeneration =
            Math.round(((sliderX - 760) * (generationCount - 1)) / 410) + 1
        } else {
          selectedGeneration = Math.round(
            ((sliderX - 760) * generationCount) / 410
          )
        }

        if (draggingSlider) {
          generationSlider.onDrag()
        }

        generationSlider.draw()
      }

      if (selectedGeneration >= 1) {
        p5.textAlign(p5.CENTER)

        const historyEntry = appState.generationHistoryMap[selectedGeneration]

        for (let k = 0; k < 3; k++) {
          p5.fill(220)
          p5.rect(760 + k * 160, 180, 140, 140)

          p5.push()

          p5.translate(830 + 160 * k, 290)
          p5.scale(60.0 / scaleToFixBug)

          const creature = historyEntry[historyEntryKeyForStatusWindow(k - 3)]

          drawCreature(creature, 0, 0, 0)

          p5.pop()
        }

        p5.fill(0)
        p5.textFont(font, 16)
        p5.text('Worst Creature', 830, 310)
        p5.text('Median Creature', 990, 310)
        p5.text('Best Creature', 1150, 310)
      }
    }

    if (statusWindow >= -3) {
      statusWindowView.draw()
    }
  }

  function setPopupSimulationCreatureId(id: number): void {
    const popupCurrentlyClosed = statusWindow == -4
    statusWindow = id

    let creature: Creature
    let targetCreatureId: number

    if (statusWindow <= -1) {
      const historyEntry = appState.generationHistoryMap[selectedGeneration]
      creature = historyEntry[historyEntryKeyForStatusWindow(statusWindow)]
      targetCreatureId = creature.id
    } else {
      targetCreatureId = statusWindow
      creature = c2[id]
    }

    if (
      popupSimulationCreatureId !== targetCreatureId ||
      popupCurrentlyClosed
    ) {
      simulationState.timer = 0

      if (gensToDo == 0) {
        // The full simulation is not running, so the popup simulation can be shown.
        appState.showPopupSimulation = true

        setSimulationState(creature)
        popupSimulationCreatureId = targetCreatureId
      }
    }
  }

  function clearPopupSimulation(): void {
    statusWindow = -4
  }

  function drawStats(x: number, y: number, size: number): void {
    p5.textAlign(p5.RIGHT)
    p5.textFont(font, 32)
    p5.fill(0)

    p5.push()

    p5.translate(x, y)
    p5.scale(size)
    p5.text('Creature ID: ' + simulationState.creature.id, 0, 32)

    let timeShow: number
    if (simulationState.speed > 60) {
      timeShow = toInt((appState.viewTimer + creaturesTested * 37) / 60) % 15
    } else {
      timeShow = appState.viewTimer / 60
    }

    p5.text('Time: ' + p5.nf(timeShow, 0, 2) + ' / 15 sec.', 0, 64)
    p5.text('Playback Speed: x' + Math.max(1, simulationState.speed), 0, 96)

    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)

    p5.text('X: ' + p5.nf(averageX / 5.0, 0, 2) + '', 0, 128)
    p5.text('Y: ' + p5.nf(-averageY / 5.0, 0, 2) + '', 0, 160)
    p5.text(
      'Energy used: ' +
        p5.nf(simulationState.creature.energyUsed, 0, 2) +
        ' yums',
      0,
      192
    )
    p5.text(
      'A.N.Nausea: ' +
        p5.nf(simulationState.creature.averageNodeNausea, 0, 2) +
        ' blehs',
      0,
      224
    )

    p5.pop()
  }

  function setSimulationState(simulationCreature: Creature): void {
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
    simulationState.creature.energyUsed = baselineEnergy
    simulationState.creature.totalNodeNausea = 0
    simulationState.creature.averageNodeNausea = 0
  }

  function setFitnessOfSimulationCreature(): void {
    const {id, nodes} = simulationState.creature
    const {averageX} = getNodesAverage(nodes)
    const index = indexOfCreatureInLatestGeneration(id)

    creaturesInLatestGeneration[index].fitness = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }
}
