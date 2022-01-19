import Node from '../Node'
import {FRICTION, GRAVITY, PRESSURE_UNIT} from '../constants'
import {applyForceToMuscle, applyForcesToNode} from '../creatures'
import {toInt} from '../math'
import {NodeOperationId} from '../node-operations'
import type {
  SimulationConfig,
  SimulationNodeCache,
  SimulationState
} from '../types'

export class CreatureSimulation {
  private config: SimulationConfig
  private state: SimulationState

  constructor(state: SimulationState, config: SimulationConfig) {
    this.config = config
    this.state = state

    this.randomFloat = this.randomFloat.bind(this)
    this.randomInt = this.randomInt.bind(this)
  }

  advance(): void {
    const {muscles, nodeCaches, nodes} = this.state.creature

    for (let i = 0; i < muscles.length; i++) {
      applyForceToMuscle(muscles[i], nodes)
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const nodeCache = nodeCaches[i]

      this.applyGravityToNode(node)
      applyForcesToNode(node)
      this.applyCollisionsToNode(node, nodeCache)
      this.processNodeAxons(node, nodeCache, nodes)
    }

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].value = nodeCaches[i].nextValue
    }

    this.state.timer++
  }

  private applyGravityToNode(node: Node): void {
    node.velocityY += GRAVITY
  }

  private applyCollisionsToNode(
    node: Node,
    nodeCache: SimulationNodeCache
  ): void {
    node.pressure = 0
    let dif = node.positionY + node.mass / 2

    if (dif >= 0) {
      this.pressNodeAgainstGround(node, 0)
    }

    if (
      node.positionY > nodeCache.previousPositionY &&
      this.config.hazelStairs >= 0
    ) {
      const bottomPointNow = node.positionY + node.mass / 2
      const bottomPointPrev = nodeCache.previousPositionY + node.mass / 2
      const levelNow = Math.ceil(bottomPointNow / this.config.hazelStairs)
      const levelPrev = Math.ceil(bottomPointPrev / this.config.hazelStairs)

      if (levelNow > levelPrev) {
        const groundLevel = levelPrev * this.config.hazelStairs
        this.pressNodeAgainstGround(node, groundLevel)
      }
    }

    nodeCache.previousPositionY = node.positionY
    nodeCache.previousPositionX = node.positionX
  }

  private processNodeAxons(
    node: Node,
    nodeCache: SimulationNodeCache,
    nodes: Node[]
  ): void {
    const axonValue1 = nodes[node.axon1].value
    const axonValue2 = nodes[node.axon2].value

    if (node.operation === NodeOperationId.Constant) {
      // constant
    } else if (node.operation === NodeOperationId.TimeInSeconds) {
      // time
      nodeCache.nextValue = this.state.timer / 60.0
    } else if (node.operation === NodeOperationId.NodePositionXFifthed) {
      // x - coordinate
      nodeCache.nextValue = node.positionX * 0.2
    } else if (
      node.operation === NodeOperationId.NegativeNodePositionYFifthed
    ) {
      // node.y - coordinate
      nodeCache.nextValue = -node.positionY * 0.2
    } else if (node.operation === NodeOperationId.AddAxons) {
      // plus
      nodeCache.nextValue = axonValue1 + axonValue2
    } else if (node.operation === NodeOperationId.SubtractAxon2FromAxon1) {
      // minus
      nodeCache.nextValue = axonValue1 - axonValue2
    } else if (node.operation === NodeOperationId.MultiplyAxons) {
      // times
      nodeCache.nextValue = axonValue1 * axonValue2
    } else if (node.operation === NodeOperationId.DivideAxon2FromAxon1) {
      // divide
      nodeCache.nextValue = axonValue2 === 0 ? 0 : axonValue1 / axonValue2
    } else if (node.operation === NodeOperationId.ModuloAxon1WithAxon2) {
      // modulus
      nodeCache.nextValue = axonValue2 === 0 ? 0 : axonValue1 % axonValue2
    } else if (node.operation === NodeOperationId.SineOfAxon1) {
      // sin
      nodeCache.nextValue = Math.sin(axonValue1)
    } else if (node.operation === NodeOperationId.SigmoidOfAxon1) {
      // sig
      nodeCache.nextValue = 1 / (1 + Math.pow(2.71828182846, -axonValue1))
    } else if (node.operation === NodeOperationId.NodePressure) {
      // pressure
      nodeCache.nextValue = node.pressure
    }
  }

  private pressNodeAgainstGround(node: Node, groundY: number): void {
    const dif = node.positionY - (groundY - node.mass / 2)
    node.pressure += dif * PRESSURE_UNIT
    node.positionY = groundY - node.mass / 2
    node.velocityY = 0
    node.positionX -= node.velocityX * node.friction

    if (node.velocityX > 0) {
      node.velocityX -= node.friction * dif * FRICTION
      if (node.velocityX < 0) {
        node.velocityX = 0
      }
    } else {
      node.velocityX += node.friction * dif * FRICTION
      if (node.velocityX > 0) {
        node.velocityX = 0
      }
    }
  }

  private randomFloat(minInclusive: number, maxExclusive: number): number {
    return this.config.randomFloatFn(minInclusive, maxExclusive)
  }

  private randomInt(minInclusive: number, maxExclusive: number): number {
    return toInt(this.randomFloat(minInclusive, maxExclusive))
  }
}
