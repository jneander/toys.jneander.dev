import {CreatureDrawer} from '../creature-drawer'
import {Creature, speciesIdForCreature} from '../creatures'
import {P5Wrapper} from '../p5-utils'
import {CreatureSimulation, SimulationConfig} from '../simulation'
import {SimulationView} from '../views/simulation-view'
import {CREATURE_GRID_TILE_WIDTH} from '.'
import {getSpeciesColor} from './helpers'

export interface PopupSimulationViewConfig {
  p5Wrapper: P5Wrapper
  scale?: number
  simulationConfig: SimulationConfig
}

export type PopupSimulationViewCreatureInfo = {
  creature: Creature
  rank: number
}

export type PopupSimulationViewAnchor = {
  startPositionX: number
  startPositionY: number
  endPositionX: number
  endPositionY: number
  margin: number
}

const INFO_BOX_HEIGHT = 52
const INFO_BOX_WIDTH = 120
const INFO_BOX_MARGIN = 5

const SIMULATION_VIEW_WIDTH = 300
const SIMULATION_VIEW_HEIGHT = 300
const SIMULATION_VIEW_MARGIN = 10

export class PopupSimulationView {
  private p5Wrapper: P5Wrapper
  private simulationView: SimulationView
  private simulationConfig: SimulationConfig
  private creatureSimulation: CreatureSimulation

  private creatureInfo: PopupSimulationViewCreatureInfo | null
  private anchor: PopupSimulationViewAnchor | null

  private showSimulationView: boolean

  constructor(config: PopupSimulationViewConfig) {
    this.p5Wrapper = config.p5Wrapper
    this.simulationConfig = config.simulationConfig

    this.creatureSimulation = new CreatureSimulation(this.simulationConfig)

    this.creatureInfo = null
    this.anchor = null

    const scale = config.scale || 1
    this.showSimulationView = false

    const {font, p5} = this.p5Wrapper

    this.simulationView = new SimulationView({
      cameraSpeed: 0.1,
      canvas: p5,

      creatureDrawer: new CreatureDrawer({
        p5Wrapper: this.p5Wrapper,
        scale,
      }),

      creatureSimulation: this.creatureSimulation,
      height: 600,
      postFont: font,
      scale,
      showArrow: false,
      simulationConfig: this.simulationConfig,
      statsFont: font,
      width: 600,
    })

    this.simulationView.setCameraZoom(0.009)
  }

  draw(): void {
    const {creatureInfo, showSimulationView} = this

    if (creatureInfo == null) {
      return
    }

    const {creature, rank} = creatureInfo

    const {infoBoxStartX, infoBoxStartY} = this.getInfoBoxStartPosition()

    this.drawInfoBox(infoBoxStartX, infoBoxStartY, creature, rank)

    if (showSimulationView) {
      const {simulationViewStartX, simulationViewStartY} = this.getSimulationViewStartPosition(
        infoBoxStartX,
        infoBoxStartY,
      )

      this.drawSimulationView(simulationViewStartX, simulationViewStartY)
    }
  }

  setCreatureInfo(creatureInfo: PopupSimulationViewCreatureInfo | null): void {
    const currentCreatureId = this.creatureInfo?.creature?.id
    this.creatureInfo = creatureInfo

    if (creatureInfo == null) {
      this.anchor = null
    } else if (creatureInfo.creature.id !== currentCreatureId) {
      this.showSimulationView = true
      this.creatureSimulation.setState(creatureInfo.creature)
    }
  }

  setAnchor(anchor: PopupSimulationViewAnchor): void {
    this.anchor = anchor
  }

  dismissSimulationView(): void {
    this.showSimulationView = false
  }

  private drawInfoBox(
    infoBoxStartX: number,
    infoBoxStartY: number,
    creature: Creature,
    rank: number,
  ): void {
    const {font, p5} = this.p5Wrapper

    const infoBoxCenterX = infoBoxStartX + INFO_BOX_WIDTH / 2

    p5.noStroke()
    p5.fill(255)
    p5.rect(infoBoxStartX, infoBoxStartY, INFO_BOX_WIDTH, INFO_BOX_HEIGHT)
    p5.fill(0)
    p5.textFont(font, 12)
    p5.textAlign(p5.CENTER)
    p5.text('#' + rank, infoBoxCenterX, infoBoxStartY + 12)
    p5.text('ID: ' + creature.id, infoBoxCenterX, infoBoxStartY + 24)
    p5.text('Fitness: ' + p5.nf(creature.fitness, 0, 3), infoBoxCenterX, infoBoxStartY + 36)
    p5.colorMode(p5.HSB, 1)

    const speciesId = speciesIdForCreature(creature)

    p5.fill(getSpeciesColor(p5, speciesId, true))
    p5.text(`Species: S${speciesIdForCreature(creature)}`, infoBoxCenterX, infoBoxStartY + 48)

    p5.colorMode(p5.RGB, 255)
  }

  private drawSimulationView(x: number, y: number): void {
    this.simulationView.draw()
    this.p5Wrapper.p5.image(
      this.simulationView.graphics,
      x,
      y,
      SIMULATION_VIEW_WIDTH,
      SIMULATION_VIEW_HEIGHT,
    )

    this.creatureSimulation.advance()
  }

  private getInfoBoxStartPosition(): {
    infoBoxStartX: number
    infoBoxStartY: number
  } {
    const anchor = this.anchor
    if (!anchor) {
      return {infoBoxStartX: 0, infoBoxStartY: 0}
    }

    let infoBoxStartX

    // Align the top edge of the info box to the top edge of the anchor.
    const infoBoxStartY = anchor.startPositionY

    /*
     * Position the info box to the right of the anchor. If there is not
     * enought horizontal space between the anchor and the right edge of the
     * canvas (with margins), position the info box to the left of the anchor
     * instead.
     */

    const spaceToRightOfAnchor = this.p5Wrapper.width - (anchor.endPositionX + anchor.margin)
    const spaceNeededForInfoBox = INFO_BOX_WIDTH + INFO_BOX_MARGIN

    if (spaceToRightOfAnchor >= spaceNeededForInfoBox) {
      infoBoxStartX = anchor.endPositionX + anchor.margin
    } else {
      infoBoxStartX = anchor.startPositionX - anchor.margin - INFO_BOX_WIDTH
    }

    return {infoBoxStartX, infoBoxStartY}
  }

  private getSimulationViewStartPosition(
    infoBoxStartX: number,
    infoBoxStartY: number,
  ): {
    simulationViewStartX: number
    simulationViewStartY: number
  } {
    const {p5Wrapper} = this

    let simulationViewStartX, simulationViewStartY

    /*
     * Align the left edge of the simulation view with the left edge of the
     * anchor. Adjust to the left as needed to ensure that the right edge of the
     * simulation view is within its margin for the right edge of the canvas.
     */

    const simulationViewMaxStartX = p5Wrapper.width - SIMULATION_VIEW_MARGIN - SIMULATION_VIEW_WIDTH

    simulationViewStartX = infoBoxStartX - INFO_BOX_MARGIN - CREATURE_GRID_TILE_WIDTH
    simulationViewStartX = Math.min(
      Math.max(simulationViewStartX, SIMULATION_VIEW_MARGIN),
      simulationViewMaxStartX,
    )

    /*
     * Position the simulation view below the info box. If there is not enought
     * vertical space between the info box and the bottom edge of the canvas
     * (with margins), position the simulation view above the info box instead.
     */

    const spaceBelowInfoBox = p5Wrapper.height - (infoBoxStartY + INFO_BOX_HEIGHT)
    const spaceNeededForSimulationView =
      INFO_BOX_MARGIN + SIMULATION_VIEW_HEIGHT + SIMULATION_VIEW_MARGIN

    if (spaceBelowInfoBox >= spaceNeededForSimulationView) {
      simulationViewStartY = infoBoxStartY + INFO_BOX_HEIGHT + INFO_BOX_MARGIN
    } else {
      simulationViewStartY = infoBoxStartY - INFO_BOX_MARGIN - SIMULATION_VIEW_HEIGHT
    }

    return {simulationViewStartX, simulationViewStartY}
  }
}
