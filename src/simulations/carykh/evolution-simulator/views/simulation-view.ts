import type p5 from 'p5'
import type {Font, Graphics} from 'p5'

import {FRAMES_FOR_CREATURE_FITNESS, POST_FONT_SIZE} from '../constants'
import type {CreatureDrawer} from '../creature-drawer'
import {averagePositionOfNodes} from '../creatures'
import {toInt} from '../math'
import type {CreatureSimulation, SimulationConfig} from '../simulation'
import type {SimulationCameraState} from '../types'

export interface SimulationViewConfig {
  cameraSpeed: number
  creatureDrawer: CreatureDrawer
  creatureSimulation: CreatureSimulation
  height: number
  p5: p5
  postFont: Font
  scale?: number
  showArrow: boolean
  simulationConfig: SimulationConfig
  statsFont: Font
  width: number
}

export class SimulationView {
  public graphics: Graphics

  private cameraState: SimulationCameraState

  private config: SimulationViewConfig
  private simulationGraphics: Graphics
  private statsGraphics: Graphics

  private scale: number

  constructor(config: SimulationViewConfig) {
    this.config = config

    this.cameraState = {
      x: 0,
      y: 0,
      zoom: 0.015,
    }

    const {height, p5, width} = this.config

    this.graphics = p5.createGraphics(width, height)
    this.simulationGraphics = p5.createGraphics(width, height)
    this.statsGraphics = p5.createGraphics(width, height)

    this.scale = config.scale || 1
  }

  draw(): void {
    const {graphics, simulationGraphics, statsGraphics} = this

    this.updateCameraPosition()
    this.drawSimulation()
    this.drawStats()

    graphics.image(simulationGraphics, 0, 0)
    graphics.image(statsGraphics, 0, 0)
  }

  setCameraPosition(x: number, y: number): void {
    this.cameraState.x = x
    this.cameraState.y = y
  }

  setCameraZoom(zoom: number): void {
    this.cameraState.zoom = Math.min(0.1, Math.max(0.002, zoom))
  }

  zoomIn(): void {
    const {zoom} = this.cameraState

    this.setCameraZoom(zoom / 1.1)
  }

  zoomOut(): void {
    const {zoom} = this.cameraState

    this.setCameraZoom(zoom * 1.1)
  }

  private drawArrow(): void {
    const {creatureSimulation, postFont} = this.config
    const {simulationGraphics} = this

    const {nodes} = creatureSimulation.getState().creature
    const {averageX} = averagePositionOfNodes(nodes)

    simulationGraphics.textAlign(simulationGraphics.CENTER)
    simulationGraphics.textFont(postFont, POST_FONT_SIZE * this.scale)
    simulationGraphics.noStroke()
    simulationGraphics.fill(120, 0, 255)
    simulationGraphics.rect(
      (averageX - 1.7) * this.scale,
      -4.8 * this.scale,
      3.4 * this.scale,
      1.1 * this.scale,
    )
    simulationGraphics.beginShape()
    simulationGraphics.vertex(averageX * this.scale, -3.2 * this.scale)
    simulationGraphics.vertex((averageX - 0.5) * this.scale, -3.7 * this.scale)
    simulationGraphics.vertex((averageX + 0.5) * this.scale, -3.7 * this.scale)
    simulationGraphics.endShape(simulationGraphics.CLOSE)
    simulationGraphics.fill(255)
    simulationGraphics.text(
      Math.round(averageX * 2) / 10 + ' m',
      averageX * this.scale,
      -3.91 * this.scale,
    )
  }

  private drawGround(): void {
    const {creatureSimulation, height, simulationConfig, width} = this.config
    const {cameraState, simulationGraphics} = this

    const {nodes} = creatureSimulation.getState().creature
    const {averageX, averageY} = averagePositionOfNodes(nodes)

    const stairDrawStart = Math.max(1, toInt(-averageY / simulationConfig.hazelStairs) - 10)

    simulationGraphics.noStroke()
    simulationGraphics.fill(0, 130, 0)

    const groundX = (cameraState.x - cameraState.zoom * (width / 2)) * this.scale
    const groundY = 0
    const groundW = cameraState.zoom * width * this.scale
    const groundH = cameraState.zoom * height * this.scale

    simulationGraphics.rect(groundX, groundY, groundW, groundH)

    if (simulationConfig.hazelStairs > 0) {
      for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
        simulationGraphics.fill(255, 255, 255, 128)
        simulationGraphics.rect(
          (averageX - 20) * this.scale,
          -simulationConfig.hazelStairs * i * this.scale,
          40 * this.scale,
          simulationConfig.hazelStairs * 0.3 * this.scale,
        )
        simulationGraphics.fill(255, 255, 255, 255)
        simulationGraphics.rect(
          (averageX - 20) * this.scale,
          -simulationConfig.hazelStairs * i * this.scale,
          40 * this.scale,
          simulationConfig.hazelStairs * 0.15 * this.scale,
        )
      }
    }
  }

  private drawPosts(): void {
    const {creatureSimulation, postFont} = this.config
    const {simulationGraphics} = this

    const {nodes} = creatureSimulation.getState().creature
    const {averageX, averageY} = averagePositionOfNodes(nodes)
    const startPostY = Math.min(-8, toInt(averageY / 4) * 4 - 4)

    if (simulationGraphics == null) {
      return
    }

    simulationGraphics.textAlign(simulationGraphics.CENTER)
    simulationGraphics.textFont(postFont, POST_FONT_SIZE * this.scale)
    simulationGraphics.noStroke()

    for (let postY = startPostY; postY <= startPostY + 8; postY += 4) {
      for (let i = toInt(averageX / 5 - 5); i <= toInt(averageX / 5 + 5); i++) {
        simulationGraphics.fill(255)
        simulationGraphics.rect(
          (i * 5 - 0.1) * this.scale,
          (-3.0 + postY) * this.scale,
          0.2 * this.scale,
          3 * this.scale,
        )
        simulationGraphics.rect(
          (i * 5 - 1) * this.scale,
          (-3.0 + postY) * this.scale,
          2 * this.scale,
          1 * this.scale,
        )
        simulationGraphics.fill(120)
        simulationGraphics.text(i + ' m', i * 5 * this.scale, (-2.17 + postY) * this.scale)
      }
    }
  }

  private drawSimulation(): void {
    const {creatureDrawer, creatureSimulation, showArrow} = this.config
    const {cameraState, simulationGraphics} = this

    const simulationState = creatureSimulation.getState()

    simulationGraphics.push()

    simulationGraphics.translate(simulationGraphics.width / 2.0, simulationGraphics.height / 2.0)
    simulationGraphics.scale(1.0 / cameraState.zoom / this.scale)
    simulationGraphics.translate(-cameraState.x * this.scale, -cameraState.y * this.scale)

    if (simulationState.timer < FRAMES_FOR_CREATURE_FITNESS || simulationState.speed > 30) {
      simulationGraphics.background(120, 200, 255)
    } else {
      simulationGraphics.background(60, 100, 128)
    }

    this.drawPosts()
    this.drawGround()

    creatureDrawer.drawCreaturePieces(
      simulationState.creature.nodes,
      simulationState.creature.muscles,
      0,
      0,
      simulationGraphics,
    )

    if (showArrow) {
      this.drawArrow()
    }

    simulationGraphics.pop()
  }

  private drawStats(): void {
    const {creatureSimulation, statsFont, width} = this.config
    const {statsGraphics} = this

    const simulationState = creatureSimulation.getState()

    const x = width - 5
    const y = 0

    statsGraphics.clear(0, 0, 0, 0)

    statsGraphics.textAlign(statsGraphics.RIGHT)
    statsGraphics.textFont(statsFont, 32)
    statsGraphics.fill(0)

    statsGraphics.push()

    statsGraphics.translate(x, y)
    statsGraphics.text('Creature ID: ' + simulationState.creature.id, 0, 32)

    const timeShow = simulationState.timer / 60

    statsGraphics.text('Time: ' + statsGraphics.nf(timeShow, 0, 2) + ' / 15 sec.', 0, 64)
    statsGraphics.text('Playback Speed: x' + Math.max(1, simulationState.speed), 0, 96)

    const {averageX, averageY} = averagePositionOfNodes(simulationState.creature.nodes)

    statsGraphics.text('X: ' + statsGraphics.nf(averageX / 5.0, 0, 2) + '', 0, 128)
    statsGraphics.text('Y: ' + statsGraphics.nf(-averageY / 5.0, 0, 2) + '', 0, 160)

    statsGraphics.pop()
  }

  private updateCameraPosition(): void {
    const {cameraSpeed, creatureSimulation} = this.config
    const {cameraState} = this

    const simulationState = creatureSimulation.getState()

    const {averageX, averageY} = averagePositionOfNodes(simulationState.creature.nodes)

    if (simulationState.speed < 30) {
      for (let s = 0; s < simulationState.speed; s++) {
        cameraState.x += (averageX - cameraState.x) * cameraSpeed
        cameraState.y += (averageY - cameraState.y) * cameraSpeed
      }
    } else {
      cameraState.x = averageX
      cameraState.y = averageY
    }
  }
}
