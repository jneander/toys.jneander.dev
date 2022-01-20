import {CreatureDrawer} from '../creature-drawer'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {creatureIdToIndex, historyEntryKeyForStatusWindow} from '../helpers'
import {CreatureSimulation, SimulationConfig} from '../simulation'
import type {SimulationState} from '../types'
import {Widget, WidgetConfig} from './shared'
import {SimulationView} from './simulation-view'

export interface PopupSimulationViewConfig extends WidgetConfig {
  simulationConfig: SimulationConfig
  simulationState: SimulationState
}

export class PopupSimulationView extends Widget {
  private simulationView: SimulationView
  private simulationConfig: SimulationConfig
  private simulationState: SimulationState
  private creatureSimulation: CreatureSimulation

  constructor(config: PopupSimulationViewConfig) {
    super(config)

    this.simulationConfig = config.simulationConfig
    this.simulationState = config.simulationState
    this.creatureSimulation = new CreatureSimulation(
      this.simulationState,
      this.simulationConfig
    )

    const {canvas, font} = this.appView

    this.simulationView = new SimulationView({
      cameraSpeed: 0.1,
      creatureDrawer: new CreatureDrawer({appView: this.appView}),
      height: 600,
      p5: canvas,
      postFont: font,
      showArrow: false,
      simulationConfig: this.simulationConfig,
      simulationState: this.simulationState,
      statsFont: font,
      width: 600
    })

    this.simulationView.setCameraZoom(0.009)
  }

  deinitialize(): void {
    this.simulationView.deinitialize()
  }

  draw(): void {
    const {appState} = this

    const {canvas, font} = this.appView

    let x, y, px, py
    let rank = appState.statusWindow + 1
    let creature

    canvas.stroke(Math.abs((canvas.frameCount % 30) - 15) * 17) // oscillate between 0–255
    canvas.strokeWeight(3)
    canvas.noFill()

    if (appState.statusWindow >= 0) {
      creature = appState.sortedCreatures[appState.statusWindow]

      if (appState.currentActivityId === ActivityId.SimulationFinished) {
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

      canvas.rect(x * 30 + 40, y * 25 + 17, 30, 25)
    } else {
      const historyEntry =
        appState.generationHistoryMap[appState.selectedGeneration]
      creature =
        historyEntry[historyEntryKeyForStatusWindow(appState.statusWindow)]

      x = 760 + (appState.statusWindow + 3) * 160
      y = 180
      px = x
      py = y
      canvas.rect(x, y, 140, 140)

      const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
      rank = ranks[appState.statusWindow + 3]
    }

    canvas.noStroke()
    canvas.fill(255)
    canvas.rect(px - 60, py, 120, 52)
    canvas.fill(0)
    canvas.textFont(font, 12)
    canvas.textAlign(canvas.CENTER)
    canvas.text('#' + rank, px, py + 12)
    canvas.text('ID: ' + creature.id, px, py + 24)
    canvas.text('Fitness: ' + canvas.nf(creature.fitness, 0, 3), px, py + 36)
    canvas.colorMode(canvas.HSB, 1)

    const sp =
      (creature.nodes.length % 10) * 10 + (creature.muscles.length % 10)
    canvas.fill(this.appView.getColor(sp, true))
    canvas.text(
      'Species: S' +
        (creature.nodes.length % 10) +
        '' +
        (creature.muscles.length % 10),
      px,
      py + 48
    )
    canvas.colorMode(canvas.RGB, 255)

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

    this.simulationView.draw()

    this.appView.canvas.image(this.simulationView.graphics, px2, py2, 300, 300)

    this.creatureSimulation.advance()
  }
}
