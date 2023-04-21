import {CreatureDrawer} from '../creature-drawer'
import {Creature, speciesIdForCreature} from '../creatures'
import {P5Wrapper} from '../p5-utils'
import {CreatureSimulation, SimulationConfig} from '../simulation'
import {SimulationView} from '../views/simulation-view'
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

      creatureDrawer: new CreatureDrawer({
        p5Wrapper: this.p5Wrapper,
        scale,
      }),

      creatureSimulation: this.creatureSimulation,
      height: 600,
      p5,
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

    const {infoBoxStartX, infoBoxStartY, simulationViewStartX, simulationViewStartY} =
      this.getPopupStartPositions()

    this.drawInfoBox(infoBoxStartX, infoBoxStartY, creature, rank)

    if (showSimulationView) {
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

  private getPopupStartPositions(): {
    infoBoxStartX: number
    infoBoxStartY: number
    simulationViewStartX: number
    simulationViewStartY: number
  } {
    const anchor = this.anchor

    const positions = {
      infoBoxStartX: 0,
      infoBoxStartY: 0,
      simulationViewStartX: 0,
      simulationViewStartY: INFO_BOX_HEIGHT + INFO_BOX_MARGIN,
    }

    if (!anchor) {
      return positions
    }

    // Align the top edge of the info box to the top edge of the anchor.
    positions.infoBoxStartY = anchor.startPositionY

    /*
     * Position the info box to the right of the anchor. If there is not
     * enought horizontal space between the anchor and the right edge of the
     * canvas (with margins), position the info box to the left of the anchor
     * instead.
     */

    const spaceToRightOfAnchor = this.p5Wrapper.width - (anchor.endPositionX + anchor.margin)

    const spaceNeededForInfoBox = INFO_BOX_WIDTH + INFO_BOX_MARGIN

    if (spaceToRightOfAnchor >= spaceNeededForInfoBox) {
      positions.infoBoxStartX = anchor.endPositionX + anchor.margin
    } else {
      positions.infoBoxStartX = anchor.startPositionX - anchor.margin - INFO_BOX_WIDTH
    }

    if (!this.showSimulationView) {
      // Only the info box is visible, and it is positioned
      return positions
    }

    const {infoBoxStartX, infoBoxStartY} = positions

    // First, try to fit everything to the right.
    if (spaceToRightOfAnchor >= SIMULATION_VIEW_WIDTH + SIMULATION_VIEW_MARGIN) {
      // Position the simulation view below the info box.
      positions.simulationViewStartX = infoBoxStartX
      positions.simulationViewStartY = infoBoxStartY + INFO_BOX_HEIGHT + INFO_BOX_MARGIN

      // Adjust for any overflow at the bottom.
      const overallEndY =
        positions.simulationViewStartY + SIMULATION_VIEW_HEIGHT + SIMULATION_VIEW_MARGIN
      const offsetY = Math.max(0, overallEndY - this.p5Wrapper.height)

      positions.infoBoxStartY -= offsetY
      positions.simulationViewStartY -= offsetY

      return positions
    }

    // Next, try to fit the simulation view below.
    const belowEndY =
      infoBoxStartY +
      INFO_BOX_HEIGHT +
      INFO_BOX_MARGIN +
      SIMULATION_VIEW_HEIGHT +
      SIMULATION_VIEW_MARGIN

    if (belowEndY <= this.p5Wrapper.height) {
      positions.simulationViewStartX =
        this.p5Wrapper.width - SIMULATION_VIEW_HEIGHT + SIMULATION_VIEW_MARGIN
      // Keep the simulation view from overflowing the left edge of the canvas
      positions.simulationViewStartX = Math.max(0, positions.simulationViewStartX)
      positions.simulationViewStartY = infoBoxStartY + INFO_BOX_HEIGHT + INFO_BOX_MARGIN

      return positions
    }

    const spaceToLeftOfAnchor = anchor.startPositionX - anchor.margin

    // Next, try to fit everything to the left.
    if (spaceToLeftOfAnchor >= SIMULATION_VIEW_WIDTH + SIMULATION_VIEW_MARGIN) {
      positions.infoBoxStartX = anchor.startPositionX - anchor.margin - INFO_BOX_WIDTH
      positions.simulationViewStartX = anchor.startPositionX - anchor.margin - SIMULATION_VIEW_WIDTH
      // Position the simulation view below the info box.
      positions.simulationViewStartY = infoBoxStartY + INFO_BOX_HEIGHT + INFO_BOX_MARGIN

      // Adjust for any overflow at the bottom.
      const overallEndY =
        positions.simulationViewStartY + SIMULATION_VIEW_HEIGHT + SIMULATION_VIEW_MARGIN
      const offsetY = Math.max(0, overallEndY - this.p5Wrapper.height)

      positions.infoBoxStartY -= offsetY
      positions.simulationViewStartY -= offsetY

      return positions
    }

    // The last option is above.
    positions.simulationViewStartX =
      this.p5Wrapper.width - SIMULATION_VIEW_HEIGHT + SIMULATION_VIEW_MARGIN
    // Keep the simulation view from overflowing the left edge of the canvas
    positions.simulationViewStartX = Math.max(0, positions.simulationViewStartX)
    positions.simulationViewStartY = anchor.startPositionY - anchor.margin - SIMULATION_VIEW_HEIGHT

    return positions
  }
}
