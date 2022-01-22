import type Creature from '../Creature'
import {CreatureDrawer} from '../creature-drawer'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {creatureIdToIndex, speciesIdForCreature} from '../helpers'
import {CreatureSimulation, SimulationConfig} from '../simulation'
import type {SimulationState} from '../types'
import {Widget, WidgetConfig} from './shared'
import {SimulationView} from './simulation-view'

export interface PopupSimulationViewConfig extends WidgetConfig {
  simulationConfig: SimulationConfig
  simulationState: SimulationState
}

export type PopupSimulationViewCreatureInfo = {
  creature: Creature
}

const INFO_BOX_HEIGHT = 52
const INFO_BOX_WIDTH = 120
const INFO_BOX_MARGIN = 5

const SIMULATION_VIEW_WIDTH = 300
const SIMULATION_VIEW_HEIGHT = 300
const SIMULATION_VIEW_MARGIN = 10

const CREATURE_WIDTH = 30
const CREATURE_HEIGHT = 25
const CREATURES_PER_ROW = 40

const CREATURE_GRID_MARGIN_X = 40
const CREATURE_GRID_MARGIN_Y = 10

export class PopupSimulationView extends Widget {
  private simulationView: SimulationView
  private simulationConfig: SimulationConfig
  private simulationState: SimulationState
  private creatureSimulation: CreatureSimulation

  private creatureInfo: PopupSimulationViewCreatureInfo | null

  private showSimulationView: boolean

  constructor(config: PopupSimulationViewConfig) {
    super(config)

    this.simulationConfig = config.simulationConfig
    this.simulationState = config.simulationState

    this.creatureSimulation = new CreatureSimulation(
      this.simulationState,
      this.simulationConfig
    )

    this.creatureInfo = null

    this.showSimulationView = false

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
    const {creatureInfo, showSimulationView} = this

    if (creatureInfo == null) {
      return
    }

    const {statusWindow} = this.appState
    const {creature} = creatureInfo

    const {infoBoxStartX, infoBoxStartY} =
      this.getInfoBoxStartPosition(creature)

    let rank = statusWindow + 1
    if (statusWindow < 0) {
      const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
      rank = ranks[statusWindow + 3]
    }

    this.drawInfoBox(infoBoxStartX, infoBoxStartY, creature, rank)

    if (showSimulationView) {
      const {simulationViewStartX, simulationViewStartY} =
        this.getSimulationViewStartPosition(infoBoxStartX, infoBoxStartY)

      this.drawSimulationView(simulationViewStartX, simulationViewStartY)
    }
  }

  setCreatureInfo(creatureInfo: PopupSimulationViewCreatureInfo | null): void {
    const currentCreatureId = this.creatureInfo?.creature?.id
    this.creatureInfo = creatureInfo

    if (creatureInfo && creatureInfo.creature.id !== currentCreatureId) {
      this.showSimulationView = true
      this.creatureSimulation.setState(creatureInfo.creature)
    }
  }

  dismissSimulationView(): void {
    this.showSimulationView = false
  }

  private drawInfoBox(
    infoBoxStartX: number,
    infoBoxStartY: number,
    creature: Creature,
    rank: number
  ): void {
    const {canvas, font} = this.appView

    const infoBoxCenterX = infoBoxStartX + INFO_BOX_WIDTH / 2

    canvas.noStroke()
    canvas.fill(255)
    canvas.rect(infoBoxStartX, infoBoxStartY, INFO_BOX_WIDTH, INFO_BOX_HEIGHT)
    canvas.fill(0)
    canvas.textFont(font, 12)
    canvas.textAlign(canvas.CENTER)
    canvas.text('#' + rank, infoBoxCenterX, infoBoxStartY + 12)
    canvas.text('ID: ' + creature.id, infoBoxCenterX, infoBoxStartY + 24)
    canvas.text(
      'Fitness: ' + canvas.nf(creature.fitness, 0, 3),
      infoBoxCenterX,
      infoBoxStartY + 36
    )
    canvas.colorMode(canvas.HSB, 1)

    const speciesId = speciesIdForCreature(creature)

    canvas.fill(this.appView.getColor(speciesId, true))
    canvas.text(
      'Species: S' +
        (creature.nodes.length % 10) +
        '' +
        (creature.muscles.length % 10),
      infoBoxCenterX,
      infoBoxStartY + 48
    )

    canvas.colorMode(canvas.RGB, 255)
  }

  private drawSimulationView(x: number, y: number): void {
    this.simulationView.draw()
    this.appView.canvas.image(
      this.simulationView.graphics,
      x,
      y,
      SIMULATION_VIEW_WIDTH,
      SIMULATION_VIEW_HEIGHT
    )

    this.creatureSimulation.advance()
  }

  private getInfoBoxStartPosition(creature: Creature): {
    infoBoxStartX: number
    infoBoxStartY: number
  } {
    const {appState, appView} = this

    let infoBoxStartX, infoBoxStartY

    if (appState.statusWindow >= 0) {
      let creatureRowIndex, creatureColumnIndex

      if (appState.currentActivityId === ActivityId.SimulationFinished) {
        const gridIndex = creatureIdToIndex(creature.id)
        creatureRowIndex = gridIndex % CREATURES_PER_ROW
        creatureColumnIndex = Math.floor(gridIndex / CREATURES_PER_ROW)
      } else {
        creatureRowIndex = appState.statusWindow % CREATURES_PER_ROW
        creatureColumnIndex =
          Math.floor(appState.statusWindow / CREATURES_PER_ROW) + 1
      }

      const creatureStartX =
        creatureRowIndex * CREATURE_WIDTH + CREATURE_GRID_MARGIN_X
      const creatureStartY =
        creatureColumnIndex * CREATURE_HEIGHT + CREATURE_GRID_MARGIN_Y

      // Align the top edge of the info box to the top edge of the creature.
      infoBoxStartY = creatureStartY

      /*
       * Position the info box to the right of the creature. If there is not
       * enought horizontal space between the creature and the right edge of the
       * canvas (with margins), position the info box to the left of the
       * creature instead.
       */

      const spaceToRightOfCreature =
        appView.width - (creatureStartX + CREATURE_WIDTH)
      const spaceNeededForInfoBox = INFO_BOX_WIDTH + INFO_BOX_MARGIN * 2

      if (spaceToRightOfCreature >= spaceNeededForInfoBox) {
        infoBoxStartX = creatureStartX + CREATURE_WIDTH + INFO_BOX_MARGIN
      } else {
        infoBoxStartX = creatureStartX - INFO_BOX_MARGIN - INFO_BOX_WIDTH
      }
    } else {
      infoBoxStartX =
        760 + (appState.statusWindow + 3) * 160 - INFO_BOX_WIDTH / 2
      infoBoxStartY = 180
    }

    return {infoBoxStartX, infoBoxStartY}
  }

  private getSimulationViewStartPosition(
    infoBoxStartX: number,
    infoBoxStartY: number
  ): {
    simulationViewStartX: number
    simulationViewStartY: number
  } {
    const {appView} = this

    let simulationViewStartX, simulationViewStartY

    /*
     * Align the left edge of the simulation view with the left edge of the
     * creature. Adjust to the left as needed to ensure that the right edge of
     * the simulation view is within its margin for the right edge of the
     * canvas.
     */

    const simulationViewMaxStartX =
      appView.width - SIMULATION_VIEW_MARGIN - SIMULATION_VIEW_WIDTH

    simulationViewStartX = infoBoxStartX - INFO_BOX_MARGIN - CREATURE_WIDTH
    simulationViewStartX = Math.min(
      Math.max(simulationViewStartX, SIMULATION_VIEW_MARGIN),
      simulationViewMaxStartX
    )

    /*
     * Position the simulation view below the info box. If there is not enought
     * vertical space between the info box and the bottom edge of the canvas
     * (with margins), position the simulation view above the info box instead.
     */

    const spaceBelowInfoBox = appView.height - (infoBoxStartY + INFO_BOX_HEIGHT)
    const spaceNeededForSimulationView =
      INFO_BOX_MARGIN + SIMULATION_VIEW_HEIGHT + SIMULATION_VIEW_MARGIN

    if (spaceBelowInfoBox >= spaceNeededForSimulationView) {
      simulationViewStartY = infoBoxStartY + INFO_BOX_HEIGHT + INFO_BOX_MARGIN
    } else {
      simulationViewStartY =
        infoBoxStartY - INFO_BOX_MARGIN - SIMULATION_VIEW_HEIGHT
    }

    return {simulationViewStartX, simulationViewStartY}
  }
}
