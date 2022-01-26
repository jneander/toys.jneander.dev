import type p5 from 'p5'
import type {Color, Font} from 'p5'

import type Creature from './Creature'
import type Muscle from './Muscle'
import type Node from './Node'
import {SCALE_TO_FIX_BUG} from './constants'
import {toInt} from './math'
import {
  AXON_COUNT_BY_NODE_OPERATION_ID,
  NODE_OPERATION_LABELS_BY_ID
} from './node-operations'
import type {P5Wrapper} from './views'

const NODE_TEXT_LINE_MULTIPLIER_Y1 = -0.08 // These are for the lines of text on each node.
const NODE_TEXT_LINE_MULTIPLIER_Y2 = 0.35

export interface CreatureDrawerConfig {
  p5Wrapper: P5Wrapper
}

export class CreatureDrawer {
  private axonColor: Color
  private axonFont: Font

  constructor(config: CreatureDrawerConfig) {
    const {p5Wrapper} = config

    this.axonColor = p5Wrapper.canvas.color(255, 255, 0)
    this.axonFont = p5Wrapper.font
  }

  drawCreature(creature: Creature, x: number, y: number, graphics: p5): void {
    this.drawCreaturePieces(creature.nodes, creature.muscles, x, y, graphics)
  }

  drawCreaturePieces(
    nodes: Node[],
    muscles: Muscle[],
    x: number,
    y: number,
    graphics: p5
  ): void {
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
        255 - toInt(node.friction * 512)
      )
    }

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

    graphics.textAlign(graphics.CENTER)
    graphics.textFont(this.axonFont, 0.4 * node.mass * SCALE_TO_FIX_BUG)
    graphics.text(
      graphics.nf(node.value, 0, 2),
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

  private drawNodeAxons(
    nodes: Node[],
    nodeIndex: number,
    x: number,
    y: number,
    graphics: p5
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

  private drawSingleAxon(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    graphics: p5
  ): void {
    const arrowHeadSize = 0.1
    const angle = Math.atan2(y2 - y1, x2 - x1)

    graphics.stroke(this.axonColor)
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

  private drawMuscle(
    muscle: Muscle,
    nodes: Node[],
    x: number,
    y: number,
    graphics: p5
  ): void {
    const ni1 = nodes[muscle.nodeConnection1]
    const ni2 = nodes[muscle.nodeConnection2]

    let w = 0.15

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      w = nodes[muscle.axon].getClampedValue() * 0.15
    }

    graphics.strokeWeight(w * SCALE_TO_FIX_BUG)
    graphics.stroke(70, 35, 0, muscle.rigidity * 3000)
    graphics.line(
      (ni1.positionX + x) * SCALE_TO_FIX_BUG,
      (ni1.positionY + y) * SCALE_TO_FIX_BUG,
      (ni2.positionX + x) * SCALE_TO_FIX_BUG,
      (ni2.positionY + y) * SCALE_TO_FIX_BUG
    )
  }

  private drawMuscleAxons(
    muscle: Muscle,
    nodes: Node[],
    x: number,
    y: number,
    graphics: p5
  ): void {
    const connectedNode1 = nodes[muscle.nodeConnection1]
    const connectedNode2 = nodes[muscle.nodeConnection2]

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      const axonSource = nodes[muscle.axon]
      const muscleMidX =
        (connectedNode1.positionX + connectedNode2.positionX) * 0.5 + x
      const muscleMidY =
        (connectedNode1.positionY + connectedNode2.positionY) * 0.5 + y

      this.drawSingleAxon(
        muscleMidX,
        muscleMidY,
        axonSource.positionX + x,
        axonSource.positionY + axonSource.mass * 0.5 + y,
        graphics
      )

      const averageMass = (connectedNode1.mass + connectedNode2.mass) * 0.5

      graphics.fill(this.axonColor)
      graphics.textAlign(graphics.CENTER)
      graphics.textFont(this.axonFont, 0.4 * averageMass * SCALE_TO_FIX_BUG)
      graphics.text(
        graphics.nf(nodes[muscle.axon].getClampedValue(), 0, 2),
        muscleMidX * SCALE_TO_FIX_BUG,
        muscleMidY * SCALE_TO_FIX_BUG
      )
    }
  }
}
