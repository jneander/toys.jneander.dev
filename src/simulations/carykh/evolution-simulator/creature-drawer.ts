import type p5 from 'p5'
import type {Color, Font} from 'p5'

import {
  AXON_COUNT_BY_NODE_OPERATION_ID,
  type Creature,
  type Muscle,
  type Node,
  NODE_OPERATION_LABELS_BY_ID,
} from './creatures'
import {toInt} from './math'
import type {P5Wrapper} from './p5-utils'

const NODE_TEXT_LINE_MULTIPLIER_Y1 = -0.08 // These are for the lines of text on each node.
const NODE_TEXT_LINE_MULTIPLIER_Y2 = 0.35

export interface CreatureDrawerConfig {
  p5Wrapper: P5Wrapper
  scale?: number
  showLabels?: boolean
}

export class CreatureDrawer {
  private axonColor: Color
  private axonFont: Font

  private scale: number
  private showLabels: boolean

  constructor(config: CreatureDrawerConfig) {
    const {p5Wrapper, scale = 1, showLabels = true} = config

    this.axonColor = p5Wrapper.p5.color(255, 255, 0)
    this.axonFont = p5Wrapper.font

    this.scale = scale
    this.showLabels = showLabels
  }

  drawCreature(creature: Creature, x: number, y: number, graphics: p5): void {
    this.drawCreaturePieces(creature.nodes, creature.muscles, x, y, graphics)
  }

  drawCreaturePieces(nodes: Node[], muscles: Muscle[], x: number, y: number, graphics: p5): void {
    for (let i = 0; i < muscles.length; i++) {
      this.drawMuscle(muscles[i], nodes, x, y, graphics)
    }

    for (let i = 0; i < nodes.length; i++) {
      this.drawNode(nodes[i], x, y, graphics)
    }

    for (let i = 0; i < muscles.length; i++) {
      this.drawMuscleAxons(muscles[i], nodes, x, y, graphics)
    }

    for (let i = 0; i < nodes.length; i++) {
      this.drawNodeAxons(nodes, i, x, y, graphics)
    }
  }

  private drawNode(node: Node, x: number, y: number, graphics: p5): void {
    let color = graphics.color(512 - toInt(node.friction * 512), 0, 0)

    if (node.friction <= 0.5) {
      color = graphics.color(
        255,
        255 - toInt(node.friction * 512),
        255 - toInt(node.friction * 512),
      )
    }

    graphics.fill(color)
    graphics.noStroke()

    graphics.ellipse(
      (node.positionX + x) * this.scale,
      (node.positionY + y) * this.scale,
      node.mass * this.scale,
      node.mass * this.scale,
    )

    if (node.friction >= 0.5) {
      graphics.fill(255)
    } else {
      graphics.fill(0)
    }

    if (!this.showLabels) {
      return
    }

    graphics.textAlign(graphics.CENTER)
    graphics.textFont(this.axonFont, 0.4 * node.mass * this.scale)

    graphics.text(
      graphics.nf(node.value, 0, 2),
      (node.positionX + x) * this.scale,
      (node.positionY + node.mass * NODE_TEXT_LINE_MULTIPLIER_Y2 + y) * this.scale,
    )

    graphics.text(
      NODE_OPERATION_LABELS_BY_ID[node.operation],
      (node.positionX + x) * this.scale,
      (node.positionY + node.mass * NODE_TEXT_LINE_MULTIPLIER_Y1 + y) * this.scale,
    )
  }

  private drawNodeAxons(
    nodes: Node[],
    nodeIndex: number,
    x: number,
    y: number,
    graphics: p5,
  ): void {
    const node = nodes[nodeIndex]

    if (AXON_COUNT_BY_NODE_OPERATION_ID[node.operation] >= 1) {
      const axonSource = nodes[nodes[nodeIndex].axon1]
      const point1x = node.positionX - node.mass * 0.3 + x
      const point1y = node.positionY - node.mass * 0.3 + y
      const point2x = axonSource.positionX + x
      const point2y = axonSource.positionY + axonSource.mass * 0.5 + y

      this.drawSingleAxon(point1x, point1y, point2x, point2y, graphics)
    }

    if (AXON_COUNT_BY_NODE_OPERATION_ID[node.operation] === 2) {
      const axonSource = nodes[nodes[nodeIndex].axon2]
      const point1x = node.positionX + node.mass * 0.3 + x
      const point1y = node.positionY - node.mass * 0.3 + y
      const point2x = axonSource.positionX + x
      const point2y = axonSource.positionY + axonSource.mass * 0.5 + y

      this.drawSingleAxon(point1x, point1y, point2x, point2y, graphics)
    }
  }

  private drawSingleAxon(x1: number, y1: number, x2: number, y2: number, graphics: p5): void {
    const arrowHeadSize = 0.1
    const angle = Math.atan2(y2 - y1, x2 - x1)

    graphics.stroke(this.axonColor)
    graphics.strokeWeight(0.03 * this.scale)
    graphics.line(x1 * this.scale, y1 * this.scale, x2 * this.scale, y2 * this.scale)

    graphics.line(
      x1 * this.scale,
      y1 * this.scale,
      (x1 + Math.cos(angle + Math.PI * 0.25) * arrowHeadSize) * this.scale,
      (y1 + Math.sin(angle + Math.PI * 0.25) * arrowHeadSize) * this.scale,
    )

    graphics.line(
      x1 * this.scale,
      y1 * this.scale,
      (x1 + Math.cos(angle + Math.PI * 1.75) * arrowHeadSize) * this.scale,
      (y1 + Math.sin(angle + Math.PI * 1.75) * arrowHeadSize) * this.scale,
    )

    graphics.noStroke()
  }

  private drawMuscle(muscle: Muscle, nodes: Node[], x: number, y: number, graphics: p5): void {
    const ni1 = nodes[muscle.nodeConnection1]
    const ni2 = nodes[muscle.nodeConnection2]

    let w = 0.15

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      w = nodes[muscle.axon].getClampedValue() * 0.15
    }

    graphics.strokeWeight(w * this.scale)
    graphics.stroke(70, 35, 0, muscle.rigidity * 3000)

    graphics.line(
      (ni1.positionX + x) * this.scale,
      (ni1.positionY + y) * this.scale,
      (ni2.positionX + x) * this.scale,
      (ni2.positionY + y) * this.scale,
    )
  }

  private drawMuscleAxons(muscle: Muscle, nodes: Node[], x: number, y: number, graphics: p5): void {
    const connectedNode1 = nodes[muscle.nodeConnection1]
    const connectedNode2 = nodes[muscle.nodeConnection2]

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      const axonSource = nodes[muscle.axon]
      const muscleMidX = (connectedNode1.positionX + connectedNode2.positionX) * 0.5 + x
      const muscleMidY = (connectedNode1.positionY + connectedNode2.positionY) * 0.5 + y

      this.drawSingleAxon(
        muscleMidX,
        muscleMidY,
        axonSource.positionX + x,
        axonSource.positionY + axonSource.mass * 0.5 + y,
        graphics,
      )

      const averageMass = (connectedNode1.mass + connectedNode2.mass) * 0.5

      if (!this.showLabels) {
        return
      }

      graphics.fill(this.axonColor)
      graphics.textAlign(graphics.CENTER)
      graphics.textFont(this.axonFont, 0.4 * averageMass * this.scale)

      graphics.text(
        graphics.nf(nodes[muscle.axon].getClampedValue(), 0, 2),
        muscleMidX * this.scale,
        muscleMidY * this.scale,
      )
    }
  }
}
