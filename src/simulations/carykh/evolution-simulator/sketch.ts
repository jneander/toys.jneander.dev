import type p5 from 'p5'
import type {Color, Font, Graphics} from 'p5'

import Creature from './Creature'
import Muscle from './Muscle'
import Node from './Node'
import Simulation from './Simulation'
import {AppController} from './app-controller'
import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  GenerationSimulationMode,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MAX,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN,
  POST_FONT_SIZE,
  SCALE_TO_FIX_BUG
} from './constants'
import {
  averagePositionOfNodes,
  creatureIdToIndex,
  historyEntryKeyForStatusWindow
} from './helpers'
import {toInt} from './math'
import {
  AXON_COUNT_BY_NODE_OPERATION_ID,
  NODE_OPERATION_LABELS_BY_ID
} from './node-operations'
import type {AppState, SimulationConfig, SimulationState} from './types'

export default function sketch(p5: p5) {
  const AXON_COLOR = p5.color(255, 255, 0)
  const FITNESS_LABEL = 'Distance'
  const FITNESS_UNIT_LABEL = 'm'
  const FONT_SIZES = [50, 36, 25, 20, 16, 14, 11, 9]
  const FRAME_RATE = 60 // target frames per second
  const NODE_TEXT_LINE_MULTIPLIER_Y1 = -0.08 // These are for the lines of text on each node.
  const NODE_TEXT_LINE_MULTIPLIER_Y2 = 0.35
  const SEED = 0
  const WINDOW_SIZE_MULTIPLIER = 0.8

  let font: Font
  let graphImage: Graphics
  let popUpImage: Graphics
  let segBarImage: Graphics

  let sliderX = 1170
  let draggingSlider = false

  const appState: AppState = {
    creatureIdsByGridIndex: new Array<number>(CREATURE_COUNT),
    creaturesInLatestGeneration: new Array<Creature>(CREATURE_COUNT),
    creaturesTested: 0,
    currentActivityId: ActivityId.Start,
    fitnessPercentileHistory: [],
    generationCount: -1,
    generationCountDepictedInGraph: -1,
    generationHistoryMap: {},
    generationSimulationMode: GenerationSimulationMode.Off,
    histogramBarCounts: [],
    pendingGenerationCount: 0,
    popupSimulationCreatureId: null,
    selectedGeneration: 0,
    showPopupSimulation: false,
    sortedCreatures: [],
    speciesCountsHistoryMap: {},
    statusWindow: -4,
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

  const simulation = new Simulation(simulationState, simulationConfig)

  const appController = new AppController({
    appState,
    randomFractFn: (minInclusive: number, maxExclusive: number) =>
      p5.random(minInclusive, maxExclusive),
    simulation,
    simulationState
  })

  interface AppViewConfig {
    height: number
    width: number
  }

  class AppView {
    height: number
    width: number

    screenGraphics: Graphics

    constructor(config: AppViewConfig) {
      this.height = config.height
      this.width = config.width

      this.screenGraphics = p5.createGraphics(1920, 1080)
    }

    getColor(i: number, adjust: boolean): Color {
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

    getCursorPosition(): {cursorX: number; cursorY: number} {
      const cursorX = p5.mouseX / WINDOW_SIZE_MULTIPLIER
      const cursorY = p5.mouseY / WINDOW_SIZE_MULTIPLIER

      return {cursorX, cursorY}
    }

    rectIsUnderCursor(
      x: number,
      y: number,
      width: number,
      height: number
    ): boolean {
      const {cursorX, cursorY} = this.getCursorPosition()

      return (
        cursorX >= x &&
        cursorX <= x + width &&
        cursorY >= y &&
        cursorY <= y + height
      )
    }
  }

  let appView: AppView

  function inter(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }

  function updateCameraPosition(): void {
    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )

    if (simulationState.speed < 30) {
      for (let s = 0; s < simulationState.speed; s++) {
        simulationState.camera.x += (averageX - simulationState.camera.x) * 0.06
        simulationState.camera.y += (averageY - simulationState.camera.y) * 0.06
      }
    } else {
      simulationState.camera.x = averageX
      simulationState.camera.y = averageY
    }
  }

  abstract class Widget {
    abstract draw(): void
  }

  class StartViewStartButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(appView.width / 2 - 200, 300, 400, 200)
      p5.fill(0)
      p5.text('START', appView.width / 2, 430)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(appView.width / 2 - 200, 300, 400, 200)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.GenerationView)
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
      return appView.rectIsUnderCursor(20, 250, 200, 100)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.GeneratingCreatures)
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
      p5.text('Back', appView.width - 250, 690)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      appState.generationCount = 0
      appController.setActivityId(ActivityId.GenerationView)
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
      return appView.rectIsUnderCursor(760, 20, 460, 40)
    }

    onClick(): void {
      appController.performStepByStepSimulation()
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
      return appView.rectIsUnderCursor(760, 70, 460, 40)
    }

    onClick(): void {
      appController.performQuickGenerationSimulation()
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
      return appView.rectIsUnderCursor(760, 120, 230, 40)
    }

    onClick(): void {
      appState.pendingGenerationCount = 1
      appController.startASAP()
    }
  }

  class SimulateAlapButton extends Widget {
    draw(): void {
      p5.noStroke()

      if (appState.pendingGenerationCount >= 2) {
        p5.fill(128, 255, 128)
      } else {
        p5.fill(70, 140, 70)
      }

      p5.rect(990, 120, 230, 40)
      p5.fill(0)
      p5.text('Do gens ALAP.', 1000, 150)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(990, 120, 230, 40)
    }

    onClick(): void {
      appState.pendingGenerationCount = 1000000000
      appController.startASAP()
    }
  }

  class StepByStepSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, appView.height - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
    }

    onClick(): void {
      for (let s = appState.viewTimer; s < 900; s++) {
        appController.advanceSimulation()
      }

      appState.viewTimer = 1021
    }
  }

  class StepByStepPlaybackSpeedButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(120, appView.height - 40, 240, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('PB speed: x' + simulationState.speed, 240, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(120, appView.height - 40, 240, 40)
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
      p5.rect(appView.width - 120, appView.height - 40, 120, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('FINISH', appView.width - 60, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(
        appView.width - 120,
        appView.height - 40,
        120,
        40
      )
    }

    onClick(): void {
      appController.finishGenerationSimulation()
    }
  }

  class SortCreaturesButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(900, 664, 260, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text('Sort', appView.width - 250, 690)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.SortingCreatures)
    }
  }

  class SortingCreaturesSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, appView.height - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
    }

    onClick(): void {
      appState.viewTimer = 100000
    }
  }

  class CullCreaturesButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(900, 670, 260, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text(
        `Kill ${Math.floor(CREATURE_COUNT / 2)}`,
        appView.width - 250,
        700
      )
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(900, 670, 260, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.CullingCreatures)
    }
  }

  class PropagateCreaturesButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(1050, 670, 160, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text('Reproduce', appView.width - 150, 700)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.PropagatingCreatures)
    }
  }

  class PropagatedCreaturesBackButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(1050, 670, 160, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text('Back', appView.width - 150, 700)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.GenerationView)
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
      if (appState.selectedGeneration >= 1) {
        fs = Math.floor(Math.log(appState.selectedGeneration) / Math.log(10))
      }

      const fontSize = FONT_SIZES[fs]

      p5.textFont(font, fontSize)
      p5.fill(0)
      p5.text(
        appState.selectedGeneration,
        sliderX + 25,
        366 + fontSize * 0.3333
      )
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(sliderX, 340, 50, 50)
    }

    onDrag(): void {
      const {cursorX} = appView.getCursorPosition()

      const sliderXMax = 1170
      const sliderXMin = 760
      const sliderXRange = sliderXMax - sliderXMin // 410

      /*
       * Update the slider position with a sluggish effect. This avoids some
       * perceived jitter in the control resulting from the frame rate.
       */

      sliderX = Math.min(
        Math.max(sliderX + (cursorX - 25 - sliderX) * 0.5, sliderXMin),
        sliderXMax
      )

      const {generationCount} = appState

      if (generationCount > 1) {
        // After 2 generations, the slider starts at generation 1.
        appState.selectedGeneration =
          Math.round(
            ((sliderX - sliderXMin) * (generationCount - 1)) / sliderXRange
          ) + 1
      } else {
        appState.selectedGeneration = Math.round(
          ((sliderX - sliderXMin) * generationCount) / sliderXRange
        )
      }
    }
  }

  class StatusWindowView extends Widget {
    draw(): void {
      let x, y, px, py
      let rank = appState.statusWindow + 1

      let creature

      p5.stroke(Math.abs((p5.frameCount % 30) - 15) * 17) // oscillate between 0–255
      p5.strokeWeight(3)
      p5.noFill()

      if (appState.statusWindow >= 0) {
        creature = appState.sortedCreatures[appState.statusWindow]

        if (appState.currentActivityId === ActivityId.FinishedStepByStep) {
          const id = creatureIdToIndex(creature.id)
          x = id % 40
          y = Math.floor(id / 40)
        } else {
          x = appState.statusWindow % 40
          y = Math.floor(appState.statusWindow / 40) + 1
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
        const historyEntry =
          appState.generationHistoryMap[appState.selectedGeneration]
        creature =
          historyEntry[historyEntryKeyForStatusWindow(appState.statusWindow)]

        x = 760 + (appState.statusWindow + 3) * 160
        y = 180
        px = x
        py = y
        p5.rect(x, y, 140, 140)

        const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
        rank = ranks[appState.statusWindow + 3]
      }

      p5.noStroke()
      p5.fill(255)
      p5.rect(px - 60, py, 120, 52)
      p5.fill(0)
      p5.textFont(font, 12)
      p5.textAlign(p5.CENTER)
      p5.text('#' + rank, px, py + 12)
      p5.text('ID: ' + creature.id, px, py + 24)
      p5.text('Fitness: ' + p5.nf(creature.fitness, 0, 3), px, py + 36)
      p5.colorMode(p5.HSB, 1)

      const sp =
        (creature.nodes.length % 10) * 10 + (creature.muscles.length % 10)
      p5.fill(appView.getColor(sp, true))
      p5.text(
        'Species: S' +
          (creature.nodes.length % 10) +
          '' +
          (creature.muscles.length % 10),
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

      const {averageX, averageY} = averagePositionOfNodes(
        simulationState.creature.nodes
      )
      simulationState.camera.x += (averageX - simulationState.camera.x) * 0.1
      simulationState.camera.y += (averageY - simulationState.camera.y) * 0.1

      popUpImage.push()
      popUpImage.translate(225, 225)
      popUpImage.scale(1.0 / simulationState.camera.zoom / SCALE_TO_FIX_BUG)
      popUpImage.translate(
        -simulationState.camera.x * SCALE_TO_FIX_BUG,
        -simulationState.camera.y * SCALE_TO_FIX_BUG
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
      appController.advanceSimulation()
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

  // ACTIVITY DRAWING

  function drawStartActivity(): void {
    p5.background(255)
    p5.noStroke()
    p5.fill(0)
    p5.text('EVOLUTION!', appView.width / 2, 200)
    startViewStartButton.draw()
  }

  function predrawGeneratedCreaturesActivity(): void {
    p5.background(220, 253, 102)
    p5.push()
    p5.scale(10.0 / SCALE_TO_FIX_BUG)

    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 40; x++) {
        const index = y * 40 + x
        const creature = appState.creaturesInLatestGeneration[index]

        drawCreature(creature, x * 3 + 5.5, y * 2.5 + 3, 0)
      }
    }

    p5.pop()
    p5.noStroke()
    p5.fill(0)
    p5.textAlign(p5.CENTER)
    p5.textFont(font, 24)
    p5.text(
      `Here are your ${CREATURE_COUNT} randomly generated creatures!!!`,
      appView.width / 2 - 200,
      690
    )
    generatedCreaturesBackButton.draw()
  }

  function drawGenerationViewActivity(): void {
    p5.noStroke()
    p5.fill(0)
    p5.background(255, 200, 130)
    p5.textFont(font, 32)
    p5.textAlign(p5.LEFT)
    p5.textFont(font, 96)
    p5.text('Generation ' + Math.max(appState.selectedGeneration, 0), 20, 100)
    p5.textFont(font, 28)

    if (appState.generationCount == -1) {
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
          appState.fitnessPercentileHistory[
            Math.min(
              appState.selectedGeneration,
              appState.fitnessPercentileHistory.length - 1
            )
          ][14] * 1000
        ) /
          1000 +
          ' ' +
          FITNESS_UNIT_LABEL,
        700,
        160
      )

      if (
        appState.generationCountDepictedInGraph !== appState.generationCount
      ) {
        drawGraph(975, 570)
        appState.generationCountDepictedInGraph = appState.generationCount
      }

      drawHistogram(760, 410, 460, 280)
      drawGraphImage()

      if (appState.generationCount >= 1) {
        generationSlider.draw()
      }

      if (appState.selectedGeneration >= 1) {
        drawWorstMedianAndBestCreatures()
      }
    }
  }

  function drawFinishedStepByStepActivity(): void {
    p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)
  }

  function drawSortingCreaturesActivity(): void {
    p5.background(220, 253, 102)
    p5.push()
    p5.scale(10.0 / SCALE_TO_FIX_BUG)

    const transition =
      0.5 - 0.5 * Math.cos(Math.min(appState.viewTimer / 60, Math.PI))

    for (let i1 = 0; i1 < CREATURE_COUNT; i1++) {
      const creature = appState.sortedCreatures[i1]
      const j2 = creature.id - appState.generationCount * CREATURE_COUNT - 1
      const x1 = j2 % 40
      const y1 = Math.floor(j2 / 40)
      const x2 = i1 % 40
      const y2 = Math.floor(i1 / 40) + 1
      const x3 = inter(x1, x2, transition)
      const y3 = inter(y1, y2, transition)

      drawCreature(creature, x3 * 3 + 5.5, y3 * 2.5 + 4, 0)
    }

    p5.pop()

    sortingCreaturesSkipButton.draw()
  }

  function drawSortedCreaturesActivity(): void {
    p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)
  }

  function drawCulledCreaturesActivity(): void {
    p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)
  }

  function drawPropagatedCreaturesActivity(): void {
    p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)
  }

  // COMPONENT DRAWING

  function drawSortedCreaturesScreenImage(): void {
    appView.screenGraphics.push()
    appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
    appView.screenGraphics.background(220, 253, 102)
    appView.screenGraphics.noStroke()

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const gridIndex = i

      const gridX = gridIndex % 40
      const gridY = Math.floor(gridIndex / 40) + 1

      drawCreature(creature, gridX * 3 + 5.5, gridY * 2.5 + 4, 1)
    }
    appView.screenGraphics.pop()

    appView.screenGraphics.push()
    appView.screenGraphics.scale(1.5)

    appView.screenGraphics.textAlign(p5.CENTER)
    appView.screenGraphics.textFont(font, 24)
    appView.screenGraphics.fill(100, 100, 200)
    appView.screenGraphics.noStroke()

    appView.screenGraphics.fill(0)
    appView.screenGraphics.text(
      'Fastest creatures at the top!',
      appView.width / 2,
      30
    )
    appView.screenGraphics.text(
      'Slowest creatures at the bottom. (Going backward = slow)',
      appView.width / 2 - 200,
      700
    )
    cullCreaturesButton.draw()

    appView.screenGraphics.pop()
  }

  function drawSimulationFinishedScreenImage(): void {
    appView.screenGraphics.push()
    appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
    appView.screenGraphics.background(220, 253, 102)
    appView.screenGraphics.noStroke()

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const gridIndex = creatureIdToIndex(creature.id)

      const gridX = gridIndex % 40
      const gridY = Math.floor(gridIndex / 40)

      drawCreature(creature, gridX * 3 + 5.5, gridY * 2.5 + 4, 1)
    }
    appView.screenGraphics.pop()

    appView.screenGraphics.push()
    appView.screenGraphics.scale(1.5)

    appView.screenGraphics.textAlign(p5.CENTER)
    appView.screenGraphics.textFont(font, 24)
    appView.screenGraphics.fill(100, 100, 200)
    appView.screenGraphics.noStroke()

    appView.screenGraphics.fill(0)
    appView.screenGraphics.text(
      "All 1,000 creatures have been tested.  Now let's sort them!",
      appView.width / 2 - 200,
      690
    )
    sortCreaturesButton.draw()

    appView.screenGraphics.pop()
  }

  function drawCulledCreaturesScreenImage(): void {
    appView.screenGraphics.push()
    appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
    appView.screenGraphics.background(220, 253, 102)
    appView.screenGraphics.noStroke()

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const gridIndex = i

      const gridX = gridIndex % 40
      const gridY = Math.floor(gridIndex / 40) + 1

      drawCreature(creature, gridX * 3 + 5.5, gridY * 2.5 + 4, 1)
    }
    appView.screenGraphics.pop()

    appView.screenGraphics.push()
    appView.screenGraphics.scale(1.5)

    appView.screenGraphics.textAlign(p5.CENTER)
    appView.screenGraphics.textFont(font, 24)
    appView.screenGraphics.fill(100, 100, 200)
    appView.screenGraphics.noStroke()

    appView.screenGraphics.fill(0)
    appView.screenGraphics.text(
      'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
      appView.width / 2,
      30
    )
    appView.screenGraphics.text(
      'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
      appView.width / 2 - 130,
      700
    )
    propagateCreaturesButton.draw()

    for (let i = 0; i < CREATURE_COUNT; i++) {
      const creature = appState.sortedCreatures[i]
      const x = i % 40
      const y = Math.floor(i / 40) + 1

      if (creature.alive) {
        drawCreature(creature, x * 30 + 55, y * 25 + 40, 0)
      } else {
        appView.screenGraphics.rect(x * 30 + 40, y * 25 + 17, 30, 25)
      }
    }

    appView.screenGraphics.pop()
  }

  function drawPropagatedCreaturesScreenImage(): void {
    appView.screenGraphics.push()
    appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
    appView.screenGraphics.background(220, 253, 102)
    appView.screenGraphics.noStroke()

    for (let i = 0; i < CREATURE_COUNT; i++) {
      let creature = appState.sortedCreatures[i]
      const index = creatureIdToIndex(creature.id)
      creature = appState.creaturesInLatestGeneration[index]

      const gridIndex = i

      const gridX = gridIndex % 40
      const gridY = Math.floor(gridIndex / 40) + 1

      drawCreature(creature, gridX * 3 + 5.5, gridY * 2.5 + 4, 1)
    }
    appView.screenGraphics.pop()

    appView.screenGraphics.push()
    appView.screenGraphics.scale(1.5)

    appView.screenGraphics.textAlign(p5.CENTER)
    appView.screenGraphics.textFont(font, 24)
    appView.screenGraphics.fill(100, 100, 200)
    appView.screenGraphics.noStroke()

    appView.screenGraphics.fill(0)
    appView.screenGraphics.text(
      'These are the 1000 creatures of generation #' +
        (appState.generationCount + 1) +
        '.',
      appView.width / 2,
      30
    )
    appView.screenGraphics.text(
      'What perils will they face?  Find out next time!',
      appView.width / 2 - 130,
      700
    )
    propagatedCreaturesBackButton.draw()

    appView.screenGraphics.pop()
  }

  function drawStepByStepSimulationView(): void {
    const {averageX} = averagePositionOfNodes(simulationState.creature.nodes)

    p5.background(120, 200, 255)

    p5.push()

    p5.translate(p5.width / 2.0, p5.height / 2.0)
    p5.scale(1.0 / simulationState.camera.zoom / SCALE_TO_FIX_BUG)
    p5.translate(
      -simulationState.camera.x * SCALE_TO_FIX_BUG,
      -simulationState.camera.y * SCALE_TO_FIX_BUG
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
  }

  function drawStepByStepFinalFitness(): void {
    const {averageX} = averagePositionOfNodes(simulationState.creature.nodes)

    p5.noStroke()
    p5.fill(0, 0, 0, 130)
    p5.rect(0, 0, appView.width, appView.height)
    p5.fill(0, 0, 0, 255)
    p5.rect(appView.width / 2 - 500, 200, 1000, 240)
    p5.fill(255, 0, 0)
    p5.textAlign(p5.CENTER)
    p5.textFont(font, 96)
    p5.text("Creature's " + FITNESS_LABEL + ':', appView.width / 2, 300)
    p5.text(
      p5.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
      appView.width / 2,
      400
    )
  }

  function drawGround(toImage: number): void {
    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )

    const stairDrawStart = Math.max(
      1,
      toInt(-averageY / simulationConfig.hazelStairs) - 10
    )

    if (toImage == 0) {
      p5.noStroke()
      p5.fill(0, 130, 0)
      p5.rect(
        (simulationState.camera.x - simulationState.camera.zoom * 800.0) *
          SCALE_TO_FIX_BUG,
        0 * SCALE_TO_FIX_BUG,
        simulationState.camera.zoom * 1600.0 * SCALE_TO_FIX_BUG,
        simulationState.camera.zoom * 900.0 * SCALE_TO_FIX_BUG
      )

      if (simulationConfig.hazelStairs > 0) {
        for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
          p5.fill(255, 255, 255, 128)
          p5.rect(
            (averageX - 20) * SCALE_TO_FIX_BUG,
            -simulationConfig.hazelStairs * i * SCALE_TO_FIX_BUG,
            40 * SCALE_TO_FIX_BUG,
            simulationConfig.hazelStairs * 0.3 * SCALE_TO_FIX_BUG
          )
          p5.fill(255, 255, 255, 255)
          p5.rect(
            (averageX - 20) * SCALE_TO_FIX_BUG,
            -simulationConfig.hazelStairs * i * SCALE_TO_FIX_BUG,
            40 * SCALE_TO_FIX_BUG,
            simulationConfig.hazelStairs * 0.15 * SCALE_TO_FIX_BUG
          )
        }
      }
    } else if (toImage == 2) {
      popUpImage.noStroke()
      popUpImage.fill(0, 130, 0)
      popUpImage.rect(
        (simulationState.camera.x - simulationState.camera.zoom * 300.0) *
          SCALE_TO_FIX_BUG,
        0 * SCALE_TO_FIX_BUG,
        simulationState.camera.zoom * 600.0 * SCALE_TO_FIX_BUG,
        simulationState.camera.zoom * 600.0 * SCALE_TO_FIX_BUG
      )

      if (simulationConfig.hazelStairs > 0) {
        for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
          popUpImage.fill(255, 255, 255, 128)
          popUpImage.rect(
            (averageX - 20) * SCALE_TO_FIX_BUG,
            -simulationConfig.hazelStairs * i * SCALE_TO_FIX_BUG,
            40 * SCALE_TO_FIX_BUG,
            simulationConfig.hazelStairs * 0.3 * SCALE_TO_FIX_BUG
          )
          popUpImage.fill(255, 255, 255, 255)
          popUpImage.rect(
            (averageX - 20) * SCALE_TO_FIX_BUG,
            -simulationConfig.hazelStairs * i * SCALE_TO_FIX_BUG,
            40 * SCALE_TO_FIX_BUG,
            simulationConfig.hazelStairs * 0.15 * SCALE_TO_FIX_BUG
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

    const graphics = [p5, appView.screenGraphics, popUpImage][toImage]

    graphics.fill(color)
    graphics.noStroke()
    graphics.ellipse(
      (node.positionX + x) * SCALE_TO_FIX_BUG,
      (node.positionY + y) * SCALE_TO_FIX_BUG,
      node.mass * SCALE_TO_FIX_BUG,
      node.mass * SCALE_TO_FIX_BUG
    )

    if (node.friction >= 0.5) {
      graphics.fill(255)
    } else {
      graphics.fill(0)
    }

    graphics.textAlign(p5.CENTER)
    graphics.textFont(font, 0.4 * node.mass * SCALE_TO_FIX_BUG)
    graphics.text(
      p5.nf(node.value, 0, 2),
      (node.positionX + x) * SCALE_TO_FIX_BUG,
      (node.positionY + node.mass * NODE_TEXT_LINE_MULTIPLIER_Y2 + y) *
        SCALE_TO_FIX_BUG
    )
    graphics.text(
      NODE_OPERATION_LABELS_BY_ID[node.operation],
      (node.positionX + x) * SCALE_TO_FIX_BUG,
      (node.positionY + node.mass * NODE_TEXT_LINE_MULTIPLIER_Y1 + y) *
        SCALE_TO_FIX_BUG
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

    const graphics = [p5, appView.screenGraphics, popUpImage][toImage]

    graphics.stroke(AXON_COLOR)
    graphics.strokeWeight(0.03 * SCALE_TO_FIX_BUG)
    graphics.line(
      x1 * SCALE_TO_FIX_BUG,
      y1 * SCALE_TO_FIX_BUG,
      x2 * SCALE_TO_FIX_BUG,
      y2 * SCALE_TO_FIX_BUG
    )
    graphics.line(
      x1 * SCALE_TO_FIX_BUG,
      y1 * SCALE_TO_FIX_BUG,
      (x1 + Math.cos(angle + Math.PI * 0.25) * arrowHeadSize) *
        SCALE_TO_FIX_BUG,
      (y1 + Math.sin(angle + Math.PI * 0.25) * arrowHeadSize) * SCALE_TO_FIX_BUG
    )
    graphics.line(
      x1 * SCALE_TO_FIX_BUG,
      y1 * SCALE_TO_FIX_BUG,
      (x1 + Math.cos(angle + Math.PI * 1.75) * arrowHeadSize) *
        SCALE_TO_FIX_BUG,
      (y1 + Math.sin(angle + Math.PI * 1.75) * arrowHeadSize) * SCALE_TO_FIX_BUG
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

    const graphics = [p5, appView.screenGraphics, popUpImage][toImage]

    graphics.strokeWeight(w * SCALE_TO_FIX_BUG)
    graphics.stroke(70, 35, 0, muscle.rigidity * 3000)
    graphics.line(
      (ni1.positionX + x) * SCALE_TO_FIX_BUG,
      (ni1.positionY + y) * SCALE_TO_FIX_BUG,
      (ni2.positionX + x) * SCALE_TO_FIX_BUG,
      (ni2.positionY + y) * SCALE_TO_FIX_BUG
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
      const graphics = [p5, appView.screenGraphics, popUpImage][toImage]

      graphics.fill(AXON_COLOR)
      graphics.textAlign(p5.CENTER)
      graphics.textFont(font, 0.4 * averageMass * SCALE_TO_FIX_BUG)
      graphics.text(
        p5.nf(nodes[muscle.axon].getClampedValue(), 0, 2),
        muscleMidX * SCALE_TO_FIX_BUG,
        muscleMidY * SCALE_TO_FIX_BUG
      )
    }
  }

  function drawPosts(toImage: number): void {
    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )
    const startPostY = Math.min(-8, toInt(averageY / 4) * 4 - 4)

    const graphics = [p5, null, popUpImage][toImage]

    if (graphics == null) {
      return
    }

    graphics.textAlign(p5.CENTER)
    graphics.textFont(font, POST_FONT_SIZE * SCALE_TO_FIX_BUG)
    graphics.noStroke()

    for (let postY = startPostY; postY <= startPostY + 8; postY += 4) {
      for (let i = toInt(averageX / 5 - 5); i <= toInt(averageX / 5 + 5); i++) {
        graphics.fill(255)
        graphics.rect(
          (i * 5 - 0.1) * SCALE_TO_FIX_BUG,
          (-3.0 + postY) * SCALE_TO_FIX_BUG,
          0.2 * SCALE_TO_FIX_BUG,
          3 * SCALE_TO_FIX_BUG
        )
        graphics.rect(
          (i * 5 - 1) * SCALE_TO_FIX_BUG,
          (-3.0 + postY) * SCALE_TO_FIX_BUG,
          2 * SCALE_TO_FIX_BUG,
          1 * SCALE_TO_FIX_BUG
        )
        graphics.fill(120)
        graphics.text(
          i + ' m',
          i * 5 * SCALE_TO_FIX_BUG,
          (-2.17 + postY) * SCALE_TO_FIX_BUG
        )
      }
    }
  }

  function drawArrow(x: number): void {
    p5.textAlign(p5.CENTER)
    p5.textFont(font, POST_FONT_SIZE * SCALE_TO_FIX_BUG)
    p5.noStroke()
    p5.fill(120, 0, 255)
    p5.rect(
      (x - 1.7) * SCALE_TO_FIX_BUG,
      -4.8 * SCALE_TO_FIX_BUG,
      3.4 * SCALE_TO_FIX_BUG,
      1.1 * SCALE_TO_FIX_BUG
    )
    p5.beginShape()
    p5.vertex(x * SCALE_TO_FIX_BUG, -3.2 * SCALE_TO_FIX_BUG)
    p5.vertex((x - 0.5) * SCALE_TO_FIX_BUG, -3.7 * SCALE_TO_FIX_BUG)
    p5.vertex((x + 0.5) * SCALE_TO_FIX_BUG, -3.7 * SCALE_TO_FIX_BUG)
    p5.endShape(p5.CLOSE)
    p5.fill(255)
    p5.text(
      Math.round(x * 2) / 10 + ' m',
      x * SCALE_TO_FIX_BUG,
      -3.91 * SCALE_TO_FIX_BUG
    )
  }

  function drawGraphImage(): void {
    p5.image(graphImage, 50, 180, 650, 380)
    p5.image(segBarImage, 50, 580, 650, 100)

    if (appState.generationCount >= 1) {
      p5.stroke(0, 160, 0, 255)
      p5.strokeWeight(3)

      const genWidth = 590.0 / appState.generationCount
      const lineX = 110 + appState.selectedGeneration * genWidth

      p5.line(lineX, 180, lineX, 500 + 180)

      p5.textAlign(p5.LEFT)
      p5.textFont(font, 12)
      p5.noStroke()

      const speciesCounts =
        appState.speciesCountsHistoryMap[appState.selectedGeneration] || []

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
          p5.fill(appView.getColor(speciesId, true))
          // Example label: "S45: 207"
          p5.text(`S${speciesId}: ${count}`, lineX + 5, y + 11)
          p5.colorMode(p5.RGB, 255)
        }

        cumulativeStart += count
      })

      p5.noStroke()
    }
  }

  function drawGraph(graphWidth: number, graphHeight: number): void {
    graphImage.background(220)

    if (appState.generationCount >= 1) {
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
    const genWidth = graphWidth / appState.generationCount
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

    for (let i = 0; i < FITNESS_PERCENTILE_CREATURE_INDICES.length; i++) {
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

      for (let i = 0; i < appState.generationCount; i++) {
        graphImage.line(
          x + i * genWidth,
          -appState.fitnessPercentileHistory[i][k] * meterHeight + zero + y,
          x + (i + 1) * genWidth,
          -appState.fitnessPercentileHistory[i + 1][k] * meterHeight + zero + y
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

    const generationWidth = graphWidth / appState.generationCount
    const generationsPerBar = Math.floor(appState.generationCount / 500) + 1

    for (let i1 = 0; i1 < appState.generationCount; i1 += generationsPerBar) {
      const i2 = Math.min(i1 + generationsPerBar, appState.generationCount)

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
        segBarImage.fill(appView.getColor(speciesId, false))
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

    for (let i = 0; i < appState.generationCount; i++) {
      const toTest =
        appState.fitnessPercentileHistory[i + 1][toInt(14 - sign * 14)]

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

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      if (appState.histogramBarCounts[appState.selectedGeneration][i] > maxH) {
        maxH = appState.histogramBarCounts[appState.selectedGeneration][i]
      }
    }

    p5.fill(200)
    p5.noStroke()
    p5.rect(x, y, hw, hh)
    p5.fill(0, 0, 0)

    const barW = hw / HISTOGRAM_BAR_SPAN
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

    for (let i = HISTOGRAM_BAR_MIN; i <= HISTOGRAM_BAR_MAX; i += 10) {
      if (i == 0) {
        p5.stroke(0, 0, 255)
      } else {
        p5.stroke(128)
      }

      const theX = x + (i - HISTOGRAM_BAR_MIN) * barW

      p5.text(p5.nf(i / HISTOGRAM_BARS_PER_METER, 0, 1), theX, y + hh + 14)
      p5.line(theX, y, theX, y + hh)
    }

    p5.noStroke()

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const h = Math.min(
        appState.histogramBarCounts[appState.selectedGeneration][i] *
          multiplier,
        hh
      )

      if (
        i + HISTOGRAM_BAR_MIN ==
        Math.floor(
          appState.fitnessPercentileHistory[
            Math.min(
              appState.selectedGeneration,
              appState.fitnessPercentileHistory.length - 1
            )
          ][14] * HISTOGRAM_BARS_PER_METER
        )
      ) {
        p5.fill(255, 0, 0)
      } else {
        p5.fill(0, 0, 0)
      }

      p5.rect(x + i * barW, y + hh - h, barW, h)
    }
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
      timeShow =
        toInt((appState.viewTimer + appState.creaturesTested * 37) / 60) % 15
    } else {
      timeShow = appState.viewTimer / 60
    }

    p5.text('Time: ' + p5.nf(timeShow, 0, 2) + ' / 15 sec.', 0, 64)
    p5.text('Playback Speed: x' + Math.max(1, simulationState.speed), 0, 96)

    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )

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

  function drawWorstMedianAndBestCreatures(): void {
    p5.noStroke()
    p5.textAlign(p5.CENTER)

    const historyEntry =
      appState.generationHistoryMap[appState.selectedGeneration]

    for (let k = 0; k < 3; k++) {
      p5.fill(220)
      p5.rect(760 + k * 160, 180, 140, 140)

      p5.push()

      p5.translate(830 + 160 * k, 290)
      p5.scale(60.0 / SCALE_TO_FIX_BUG)

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

  function updateSelectedGenerationAndSliderPosition(): void {
    // Update slider position to reflect change in generation range.

    const {generationCount, selectedGeneration} = appState
    const sliderXMax = 1170
    const sliderXMin = 760
    const sliderXRange = sliderXMax - sliderXMin // 410

    if (selectedGeneration === generationCount - 1) {
      // Continue selecting latest generation.
      sliderX = sliderXMax
      appState.selectedGeneration = generationCount
    } else {
      // Preserve previously-selected generation by shifting slider.
      let previousGenerationRange = generationCount - 1
      if (previousGenerationRange > 1) {
        previousGenerationRange--
      }

      let currentGenerationRange = generationCount
      if (generationCount > 1) {
        // After 2 generations, the slider starts at generation 1.
        currentGenerationRange--
      }

      let sliderPercentage = (sliderX - sliderXMin) / sliderXRange
      sliderPercentage *= previousGenerationRange / currentGenerationRange

      sliderX = Math.round(sliderPercentage * sliderXRange + sliderXMin)
    }
  }

  p5.mouseWheel = (event: WheelEvent) => {
    const delta = event.deltaX

    if (appState.currentActivityId === ActivityId.SimulationRunning) {
      if (delta < 0) {
        simulationState.camera.zoom *= 0.9090909

        if (simulationState.camera.zoom < 0.002) {
          simulationState.camera.zoom = 0.002
        }

        p5.textFont(font, POST_FONT_SIZE)
      } else if (delta > 0) {
        simulationState.camera.zoom *= 1.1

        if (simulationState.camera.zoom > 0.1) {
          simulationState.camera.zoom = 0.1
        }

        p5.textFont(font, POST_FONT_SIZE)
      }
    }
  }

  p5.mousePressed = () => {
    if (appState.pendingGenerationCount >= 1) {
      appState.pendingGenerationCount = 0
    }

    if (
      appState.currentActivityId === ActivityId.GenerationView &&
      appState.generationCount >= 1 &&
      generationSlider.isUnderCursor()
    ) {
      draggingSlider = true
    }
  }

  p5.mouseReleased = () => {
    draggingSlider = false
    // When the popup simulation is running, mouse clicks will stop it.
    appState.showPopupSimulation = false

    if (
      appState.currentActivityId === ActivityId.Start &&
      startViewStartButton.isUnderCursor()
    ) {
      startViewStartButton.onClick()
    } else if (
      appState.currentActivityId === ActivityId.GenerationView &&
      appState.generationCount == -1 &&
      generationViewCreateButton.isUnderCursor()
    ) {
      generationViewCreateButton.onClick()
    } else if (
      appState.currentActivityId === ActivityId.GenerationView &&
      appState.generationCount >= 0
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
      appState.currentActivityId === ActivityId.GeneratedCreatures &&
      generatedCreaturesBackButton.isUnderCursor()
    ) {
      generatedCreaturesBackButton.onClick()
    } else if (
      appState.currentActivityId === ActivityId.FinishedStepByStep &&
      sortCreaturesButton.isUnderCursor()
    ) {
      sortCreaturesButton.onClick()
    } else if (appState.currentActivityId === ActivityId.SimulationRunning) {
      if (stepByStepSkipButton.isUnderCursor()) {
        stepByStepSkipButton.onClick()
      } else if (stepByStepPlaybackSpeedButton.isUnderCursor()) {
        stepByStepPlaybackSpeedButton.onClick()
      } else if (stepByStepFinishButton.isUnderCursor()) {
        stepByStepFinishButton.onClick()
      }
    } else if (
      appState.currentActivityId === ActivityId.SortingCreatures &&
      sortingCreaturesSkipButton.isUnderCursor()
    ) {
      sortingCreaturesSkipButton.onClick()
    } else if (
      appState.currentActivityId === ActivityId.SortedCreatures &&
      cullCreaturesButton.isUnderCursor()
    ) {
      cullCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === ActivityId.CulledCreatures &&
      propagateCreaturesButton.isUnderCursor()
    ) {
      propagateCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === ActivityId.PropagatedCreatures &&
      propagatedCreaturesBackButton.isUnderCursor()
    ) {
      propagatedCreaturesBackButton.onClick()
    }
  }

  p5.preload = () => {
    font = p5.loadFont('/fonts/Helvetica-Bold.otf')
  }

  p5.setup = () => {
    p5.frameRate(FRAME_RATE)
    p5.randomSeed(SEED)

    appView = new AppView({
      height: 720,
      width: 1280
    })

    // Create a 1024x576 Canvas
    p5.createCanvas(
      appView.width * WINDOW_SIZE_MULTIPLIER,
      appView.height * WINDOW_SIZE_MULTIPLIER
    )
    p5.ellipseMode(p5.CENTER)

    appState.fitnessPercentileHistory.push(
      new Array(FITNESS_PERCENTILE_CREATURE_INDICES.length).fill(0.0)
    )
    appState.histogramBarCounts.push(new Array(HISTOGRAM_BAR_SPAN).fill(0))

    graphImage = p5.createGraphics(975, 570)
    popUpImage = p5.createGraphics(450, 450)
    segBarImage = p5.createGraphics(975, 150)

    segBarImage.background(220)
    popUpImage.background(220)

    p5.textFont(font, 96)
    p5.textAlign(p5.CENTER)
  }

  p5.draw = () => {
    p5.scale(WINDOW_SIZE_MULTIPLIER)

    if (appState.currentActivityId === ActivityId.Start) {
      drawStartActivity()
    } else if (appState.currentActivityId === ActivityId.GenerationView) {
      if (draggingSlider && appState.generationCount >= 1) {
        generationSlider.onDrag()
      }

      drawGenerationViewActivity()

      if (appState.pendingGenerationCount > 0) {
        appState.pendingGenerationCount--

        if (appState.pendingGenerationCount > 0) {
          appController.startASAP()
        }
      } else {
        appState.generationSimulationMode = GenerationSimulationMode.Off
      }

      if (appState.generationSimulationMode === GenerationSimulationMode.ASAP) {
        appController.setSimulationState(
          appState.creaturesInLatestGeneration[appState.creaturesTested]
        )
        appController.finishGenerationSimulationFromIndex(0)
        appController.sortCreatures()
        appController.updateHistory()
        appController.cullCreatures()
        appController.propagateCreatures()
        updateSelectedGenerationAndSliderPosition()
      }
    } else if (appState.currentActivityId === ActivityId.GeneratingCreatures) {
      appController.generateCreatures()
      predrawGeneratedCreaturesActivity()
      appController.setActivityId(ActivityId.GeneratedCreatures)
    }

    if (appState.currentActivityId === ActivityId.SimulationRunning) {
      // simulate running

      if (appState.viewTimer <= 900) {
        for (let s = 0; s < simulationState.speed; s++) {
          if (appState.viewTimer < 900) {
            // For each point of speed, advance through one cycle of simulation.
            appController.advanceSimulation()
          }
        }

        updateCameraPosition()
        drawStepByStepSimulationView()
        drawStats(appView.width - 10, 0, 0.7)

        stepByStepSkipButton.draw()
        stepByStepPlaybackSpeedButton.draw()
        stepByStepFinishButton.draw()
      }

      if (appState.viewTimer == 900) {
        if (simulationState.speed < 30) {
          // When the simulation speed is slow enough, display the creature's fitness.
          drawStepByStepFinalFitness()
        } else {
          // When the simulation speed is too fast, skip ahead to next simulation using the timer.
          appState.viewTimer = 1020
        }

        appController.setFitnessOfSimulationCreature()
      }

      if (appState.viewTimer >= 1020) {
        appState.creaturesTested++

        if (appState.creaturesTested < CREATURE_COUNT) {
          appController.setSimulationState(
            appState.creaturesInLatestGeneration[appState.creaturesTested]
          )
        } else {
          appController.setActivityId(ActivityId.SimulationFinished)
        }

        simulationState.camera.x = 0
      }

      if (appState.viewTimer >= 900) {
        appState.viewTimer += simulationState.speed
      }
    }

    if (appState.currentActivityId === ActivityId.SimulationFinished) {
      appController.sortCreatures()
      appController.updateHistory()

      appState.viewTimer = 0
      appController.updateCreatureIdsByGridIndex()
      drawSimulationFinishedScreenImage()
      appController.setActivityId(ActivityId.FinishedStepByStep)
    }

    if (appState.currentActivityId === ActivityId.SortingCreatures) {
      drawSortingCreaturesActivity()

      if (
        appState.generationSimulationMode === GenerationSimulationMode.Quick
      ) {
        appState.viewTimer += 10
      } else {
        appState.viewTimer += 2
      }

      if (appState.viewTimer > 60 * Math.PI) {
        appState.viewTimer = 0
        drawSortedCreaturesScreenImage()
        appController.setActivityId(ActivityId.SortedCreatures)
      }
    }

    const {cursorX, cursorY} = appView.getCursorPosition()

    if (
      (appState.currentActivityId === ActivityId.FinishedStepByStep ||
        appState.currentActivityId === ActivityId.SortingCreatures ||
        appState.currentActivityId === ActivityId.SortedCreatures ||
        appState.currentActivityId === ActivityId.CullingCreatures ||
        appState.currentActivityId === ActivityId.CulledCreatures) &&
      appState.pendingGenerationCount == 0 &&
      !draggingSlider
    ) {
      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      let idOfCreatureUnderCursor: number | null = null

      if (Math.abs(cursorX - 639.5) <= 599.5) {
        if (
          appState.currentActivityId === ActivityId.FinishedStepByStep &&
          Math.abs(cursorY - 329) <= 312
        ) {
          idOfCreatureUnderCursor =
            appState.creatureIdsByGridIndex[
              Math.floor((cursorX - 40) / 30) +
                Math.floor((cursorY - 17) / 25) * 40
            ]
        } else if (
          (appState.currentActivityId === ActivityId.SortedCreatures ||
            appState.currentActivityId === ActivityId.CullingCreatures ||
            appState.currentActivityId === ActivityId.CulledCreatures) &&
          Math.abs(cursorY - 354) <= 312
        ) {
          idOfCreatureUnderCursor =
            Math.floor((cursorX - 40) / 30) +
            Math.floor((cursorY - 42) / 25) * 40
        }
      }

      if (idOfCreatureUnderCursor != null) {
        appController.setPopupSimulationCreatureId(idOfCreatureUnderCursor)
      } else {
        appController.clearPopupSimulation()
      }
    } else if (
      appState.currentActivityId === ActivityId.GenerationView &&
      appState.selectedGeneration >= 1 &&
      appState.pendingGenerationCount == 0 &&
      !draggingSlider
    ) {
      /*
       * When the cursor is over the worst, median, or best creature, the popup
       * simulation will be displayed for that creature.
       */

      let worstMedianOrBest: number | null = null

      if (Math.abs(cursorY - 250) <= 70) {
        if (Math.abs(cursorX - 990) <= 230) {
          const modX = (cursorX - 760) % 160

          if (modX < 140) {
            worstMedianOrBest = Math.floor((cursorX - 760) / 160) - 3
          }
        }
      }

      if (worstMedianOrBest != null) {
        appController.setPopupSimulationCreatureId(worstMedianOrBest)
      } else {
        appController.clearPopupSimulation()
      }
    } else {
      appController.clearPopupSimulation()
    }

    if (appState.currentActivityId === ActivityId.CullingCreatures) {
      appController.cullCreatures()

      appState.viewTimer = 0
      drawCulledCreaturesScreenImage()
      appController.setActivityId(ActivityId.CulledCreatures)
    }

    if (appState.currentActivityId === ActivityId.PropagatingCreatures) {
      appController.propagateCreatures()
      updateSelectedGenerationAndSliderPosition()

      appState.viewTimer = 0
      drawPropagatedCreaturesScreenImage()
      appController.setActivityId(ActivityId.PropagatedCreatures)
    }

    if (appState.currentActivityId === ActivityId.FinishedStepByStep) {
      drawFinishedStepByStepActivity()
    }

    if (appState.currentActivityId === ActivityId.SortedCreatures) {
      drawSortedCreaturesActivity()
    }

    if (appState.currentActivityId === ActivityId.CulledCreatures) {
      drawCulledCreaturesActivity()
    }

    if (appState.currentActivityId === ActivityId.PropagatedCreatures) {
      drawPropagatedCreaturesActivity()
    }

    if (appState.statusWindow >= -3) {
      statusWindowView.draw()
    }
  }
}
