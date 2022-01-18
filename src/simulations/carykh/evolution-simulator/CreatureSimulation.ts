import Creature from './Creature'
import Muscle from './Muscle'
import Node from './Node'
import {
  AIR_FRICTION,
  BIG_MUTATION_CHANCE,
  ENERGY_UNIT,
  FRICTION,
  GRAVITY,
  MAX_MUSCLE_LENGTH_INCLUSIVE,
  MIN_MUSCLE_LENGTH_INCLUSIVE,
  NAUSEA_UNIT,
  NODE_MASS_DEFAULT,
  PRESSURE_UNIT
} from './constants'
import {randomArrayValue} from './helpers'
import {dist2d, toInt} from './math'
import {
  AXON_COUNT_BY_NODE_OPERATION_ID,
  NodeOperationId,
  NODE_OPERATION_IDS
} from './node-operations'
import type {SimulationConfig, SimulationState} from './types'

export default class CreatureSimulation {
  private config: SimulationConfig
  private state: SimulationState

  constructor(state: SimulationState, config: SimulationConfig) {
    this.config = config
    this.state = state

    this.randomFloat = this.randomFloat.bind(this)
    this.randomInt = this.randomInt.bind(this)
  }

  generateCreature(id: number): Creature {
    const nodes: Node[] = []
    const muscles: Muscle[] = []

    const nodeNum = this.randomInt(3, 6)
    const muscleNum = this.randomInt(nodeNum - 1, nodeNum * 3 - 6)

    for (let i = 0; i < nodeNum; i++) {
      nodes.push(
        new Node(
          this.randomFloat(-1, 1),
          this.randomFloat(-1, 1),
          0,
          0,
          NODE_MASS_DEFAULT,
          this.randomFloat(0, 1),
          this.randomFloat(0, 1),
          randomArrayValue(NODE_OPERATION_IDS, this.randomInt),
          this.randomInt(0, nodeNum),
          this.randomInt(0, nodeNum)
        )
      )
    }

    for (let i = 0; i < muscleNum; i++) {
      const taxon = this.getNewMuscleAxon(nodeNum)

      let tc1 = 0
      let tc2 = 0

      if (i < nodeNum - 1) {
        tc1 = i
        tc2 = i + 1
      } else {
        tc1 = this.randomInt(0, nodeNum)
        tc2 = tc1

        while (tc2 == tc1) {
          tc2 = this.randomInt(0, nodeNum)
        }
      }

      const len = this.randomFloat(
        MIN_MUSCLE_LENGTH_INCLUSIVE,
        MAX_MUSCLE_LENGTH_INCLUSIVE
      )

      muscles.push(
        new Muscle(taxon, tc1, tc2, len, this.randomFloat(0.02, 0.08))
      )
    }

    this.stabilizeNodesAndMuscles(nodes, muscles)
    this.adjustNodesToCenter(nodes)

    const heartbeat = this.randomFloat(40, 80)
    const creature = new Creature(id, nodes, muscles, 0, true, heartbeat, 1.0)

    this.resolveCreatureIssues(creature)

    return creature
  }

  advance(): void {
    for (let i = 0; i < this.state.creature.muscles.length; i++) {
      const {muscles, nodes} = this.state.creature
      this.applyForceToMuscle(muscles[i], nodes)
    }

    for (let i = 0; i < this.state.creature.nodes.length; i++) {
      const ni = this.state.creature.nodes[i]
      this.applyGravityToNode(ni)
      this.applyForcesToNode(ni)
      this.applyCollisionsToNode(ni)
      this.processNodeAxons(ni, this.state.creature.nodes)
    }

    for (let i = 0; i < this.state.creature.nodes.length; i++) {
      this.state.creature.nodes[i].realizeMathValues()
    }

    this.state.creature.averageNodeNausea =
      this.state.creature.totalNodeNausea / this.state.creature.nodes.length

    this.state.timer++
  }

  stabilizeNodesAndMuscles(nodes: Node[], muscles: Muscle[]): void {
    for (let j = 0; j < 200; j++) {
      for (let i = 0; i < muscles.length; i++) {
        this.applyForceToMuscle(muscles[i], nodes)
      }

      for (let i = 0; i < nodes.length; i++) {
        this.applyForcesToNode(nodes[i])
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      ni.velocityX = 0
      ni.velocityY = 0
    }
  }

  adjustNodesToCenter(nodes: Node[]): void {
    let avx = 0
    let lowY = -1000

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      avx += ni.positionX

      if (ni.positionY + ni.mass / 2 > lowY) {
        lowY = ni.positionY + ni.mass / 2
      }
    }

    avx /= nodes.length

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      ni.positionX -= avx
      ni.positionY -= lowY
    }
  }

  modifyCreature(creature: Creature, id: number): Creature {
    const modifiedCreature = new Creature(
      id,
      [],
      [],
      0,
      true,
      creature.creatureTimer +
        this.reducedRandomForMutation() * 16 * creature.mutability,
      Math.min(creature.mutability * this.randomFloat(0.8, 1.25), 2)
    )

    for (let i = 0; i < creature.nodes.length; i++) {
      modifiedCreature.nodes.push(
        this.modifyNode(
          creature.nodes[i],
          creature.mutability,
          creature.nodes.length
        )
      )
    }

    for (let i = 0; i < creature.muscles.length; i++) {
      const muscle = this.modifyMuscle(
        creature.muscles[i],
        creature.nodes.length,
        creature.mutability
      )
      modifiedCreature.muscles.push(muscle)
    }

    if (
      this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * creature.mutability ||
      creature.nodes.length <= 2
    ) {
      // Add a node
      this.addRandomNode(modifiedCreature)
    }

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * creature.mutability) {
      // Add a muscle
      this.addRandomMuscle(modifiedCreature, -1, -1)
    }

    if (
      this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * creature.mutability &&
      modifiedCreature.nodes.length >= 4
    ) {
      // Remove a node
      this.removeRandomNode(modifiedCreature)
    }

    if (
      this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * creature.mutability &&
      modifiedCreature.muscles.length >= 2
    ) {
      // Remove a muscle
      this.removeRandomMuscle(modifiedCreature)
    }

    this.resolveCreatureIssues(modifiedCreature)

    return modifiedCreature
  }

  private applyForceToMuscle(muscle: Muscle, nodes: Node[]): void {
    let target = muscle.previousTarget

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      target = muscle.length * nodes[muscle.axon].getClampedValue()
    } else {
      target = muscle.length
    }

    const ni1 = nodes[muscle.nodeConnection1]
    const ni2 = nodes[muscle.nodeConnection2]

    const distance = dist2d(
      ni1.positionX,
      ni1.positionY,
      ni2.positionX,
      ni2.positionY
    )
    const angle = Math.atan2(
      ni1.positionY - ni2.positionY,
      ni1.positionX - ni2.positionX
    )

    const force = Math.min(Math.max(1 - distance / target, -0.4), 0.4)
    ni1.velocityX += (Math.cos(angle) * force * muscle.rigidity) / ni1.mass
    ni1.velocityY += (Math.sin(angle) * force * muscle.rigidity) / ni1.mass
    ni2.velocityX -= (Math.cos(angle) * force * muscle.rigidity) / ni2.mass
    ni2.velocityY -= (Math.sin(angle) * force * muscle.rigidity) / ni2.mass

    this.state.creature.energyUsed = Math.max(
      this.state.creature.energyUsed +
        Math.abs(muscle.previousTarget - target) *
          muscle.rigidity *
          ENERGY_UNIT,
      0
    )

    muscle.previousTarget = target
  }

  private applyForcesToNode(node: Node): void {
    node.velocityX *= AIR_FRICTION
    node.velocityY *= AIR_FRICTION
    node.positionY += node.velocityY
    node.positionX += node.velocityX
    const acc = dist2d(
      node.velocityX,
      node.velocityY,
      node.previousVelocityX,
      node.previousVelocityY
    )
    this.state.creature.totalNodeNausea += acc * acc * NAUSEA_UNIT
    node.previousVelocityX = node.velocityX
    node.previousVelocityY = node.velocityY
  }

  private applyGravityToNode(node: Node): void {
    node.velocityY += GRAVITY
  }

  private applyCollisionsToNode(node: Node): void {
    node.pressure = 0
    let dif = node.positionY + node.mass / 2

    if (dif >= 0) {
      this.pressNodeAgainstGround(node, 0)
    }

    if (
      node.positionY > node.previousPositionY &&
      this.config.hazelStairs >= 0
    ) {
      const bottomPointNow = node.positionY + node.mass / 2
      const bottomPointPrev = node.previousPositionY + node.mass / 2
      const levelNow = Math.ceil(bottomPointNow / this.config.hazelStairs)
      const levelPrev = Math.ceil(bottomPointPrev / this.config.hazelStairs)

      if (levelNow > levelPrev) {
        const groundLevel = levelPrev * this.config.hazelStairs
        this.pressNodeAgainstGround(node, groundLevel)
      }
    }

    node.previousPositionY = node.positionY
    node.previousPositionX = node.positionX
  }

  private modifyMuscle(
    muscle: Muscle,
    nodeCount: number,
    mutability: number
  ): Muscle {
    let newc1 = muscle.nodeConnection1
    let newc2 = muscle.nodeConnection2
    let newAxon = muscle.axon

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newc1 = this.randomInt(0, nodeCount)
    }

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newc2 = this.randomInt(0, nodeCount)
    }

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon = this.getNewMuscleAxon(nodeCount)
    }

    const newR = Math.min(
      Math.max(
        muscle.rigidity *
          (1 + this.reducedRandomForMutation() * 0.9 * mutability),
        0.01
      ),
      0.08
    )
    const newLen = Math.min(
      Math.max(
        muscle.length + this.reducedRandomForMutation() * mutability,
        0.4
      ),
      1.25
    )

    return new Muscle(newAxon, newc1, newc2, newLen, newR)
  }

  private modifyNode(node: Node, mutability: number, nodeNum: number): Node {
    const newX =
      node.positionX + this.reducedRandomForMutation() * 0.5 * mutability
    const newY =
      node.positionY + this.reducedRandomForMutation() * 0.5 * mutability

    let newV =
      node.value * (1 + this.reducedRandomForMutation() * 0.2 * mutability)
    let newOperation = node.operation
    let newAxon1 = node.axon1
    let newAxon2 = node.axon2

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newOperation = randomArrayValue(NODE_OPERATION_IDS, this.randomInt)
    }
    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon1 = this.randomInt(0, nodeNum)
    }
    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon2 = this.randomInt(0, nodeNum)
    }

    if (newOperation === NodeOperationId.TimeInSeconds) {
      // time
      newV = 0
    } else if (newOperation == NodeOperationId.NodePositionXFifthed) {
      // x - coordinate
      newV = newX * 0.2
    } else if (newOperation == NodeOperationId.NegativeNodePositionYFifthed) {
      // node.y - coordinate
      newV = -newY * 0.2
    }

    return new Node(
      newX,
      newY,
      0,
      0,
      NODE_MASS_DEFAULT,
      Math.min(
        Math.max(
          node.friction + this.reducedRandomForMutation() * 0.1 * mutability,
          0
        ),
        1
      ),
      newV,
      newOperation,
      newAxon1,
      newAxon2
    )
  }

  private processNodeAxons(node: Node, nodes: Node[]): void {
    const axonValue1 = nodes[node.axon1].value
    const axonValue2 = nodes[node.axon2].value

    if (node.operation === NodeOperationId.Constant) {
      // constant
    } else if (node.operation === NodeOperationId.TimeInSeconds) {
      // time
      node.valueToBe = this.state.timer / 60.0
    } else if (node.operation === NodeOperationId.NodePositionXFifthed) {
      // x - coordinate
      node.valueToBe = node.positionX * 0.2
    } else if (
      node.operation === NodeOperationId.NegativeNodePositionYFifthed
    ) {
      // node.y - coordinate
      node.valueToBe = -node.positionY * 0.2
    } else if (node.operation === NodeOperationId.AddAxons) {
      // plus
      node.valueToBe = axonValue1 + axonValue2
    } else if (node.operation === NodeOperationId.SubtractAxon2FromAxon1) {
      // minus
      node.valueToBe = axonValue1 - axonValue2
    } else if (node.operation === NodeOperationId.MultiplyAxons) {
      // times
      node.valueToBe = axonValue1 * axonValue2
    } else if (node.operation === NodeOperationId.DivideAxon2FromAxon1) {
      // divide
      node.valueToBe = axonValue2 === 0 ? 0 : axonValue1 / axonValue2
    } else if (node.operation === NodeOperationId.ModuloAxon1WithAxon2) {
      // modulus
      node.valueToBe = axonValue2 === 0 ? 0 : axonValue1 % axonValue2
    } else if (node.operation === NodeOperationId.SineOfAxon1) {
      // sin
      node.valueToBe = Math.sin(axonValue1)
    } else if (node.operation === NodeOperationId.SigmoidOfAxon1) {
      // sig
      node.valueToBe = 1 / (1 + Math.pow(2.71828182846, -axonValue1))
    } else if (node.operation === NodeOperationId.NodePressure) {
      // pressure
      node.valueToBe = node.pressure
    }
  }

  private addRandomNode(creature: Creature): void {
    const parentNode = this.randomInt(0, creature.nodes.length)
    const ang1 = this.randomFloat(0, 2 * Math.PI)
    const distance = Math.sqrt(this.randomFloat(0, 1))
    const x =
      creature.nodes[parentNode].positionX + Math.cos(ang1) * 0.5 * distance
    const y =
      creature.nodes[parentNode].positionY + Math.sin(ang1) * 0.5 * distance

    const newNodeCount = creature.nodes.length + 1

    creature.nodes.push(
      new Node(
        x,
        y,
        0,
        0,
        NODE_MASS_DEFAULT,
        this.randomFloat(0, 1),
        this.randomFloat(0, 1),
        randomArrayValue(NODE_OPERATION_IDS, this.randomInt),
        this.randomInt(0, newNodeCount),
        this.randomInt(0, newNodeCount)
      )
    )

    let nextClosestNode = 0
    let record = 100000

    for (let i = 0; i < creature.nodes.length - 1; i++) {
      if (i != parentNode) {
        const dx = creature.nodes[i].positionX - x
        const dy = creature.nodes[i].positionY - y

        if (Math.sqrt(dx * dx + dy * dy) < record) {
          record = Math.sqrt(dx * dx + dy * dy)
          nextClosestNode = i
        }
      }
    }

    this.addRandomMuscle(creature, parentNode, creature.nodes.length - 1)
    this.addRandomMuscle(creature, nextClosestNode, creature.nodes.length - 1)
  }

  private addRandomMuscle(creature: Creature, tc1: number, tc2: number): void {
    const axon = this.getNewMuscleAxon(creature.nodes.length)

    if (tc1 == -1) {
      tc1 = this.randomInt(0, creature.nodes.length)
      tc2 = tc1

      while (tc2 == tc1 && creature.nodes.length >= 2) {
        tc2 = this.randomInt(0, creature.nodes.length)
      }
    }

    let len = this.randomFloat(
      MIN_MUSCLE_LENGTH_INCLUSIVE,
      MAX_MUSCLE_LENGTH_INCLUSIVE
    )

    if (tc1 != -1) {
      len = dist2d(
        creature.nodes[tc1].positionX,
        creature.nodes[tc1].positionY,
        creature.nodes[tc2].positionX,
        creature.nodes[tc2].positionY
      )
    }

    creature.muscles.push(
      new Muscle(axon, tc1, tc2, len, this.randomFloat(0.02, 0.08))
    )
  }

  private removeRandomNode(creature: Creature): void {
    const choice = this.randomInt(0, creature.nodes.length)
    creature.nodes.splice(choice, 1)

    let i = 0

    while (i < creature.muscles.length) {
      if (
        creature.muscles[i].nodeConnection1 == choice ||
        creature.muscles[i].nodeConnection2 == choice
      ) {
        creature.muscles.splice(i, 1)
      } else {
        i++
      }
    }

    for (let j = 0; j < creature.muscles.length; j++) {
      if (creature.muscles[j].nodeConnection1 >= choice) {
        creature.muscles[j].nodeConnection1--
      }

      if (creature.muscles[j].nodeConnection2 >= choice) {
        creature.muscles[j].nodeConnection2--
      }
    }
  }

  private removeRandomMuscle(creature: Creature): void {
    const choice = this.randomInt(0, creature.muscles.length)
    creature.muscles.splice(choice, 1)
  }

  private resolveCreatureIssues(creature: Creature): void {
    this.resolveCreatureMuscleOverlap(creature)
    this.resolveCreatureLoneNodes(creature)
    this.resolveCreatureBadAxons(creature)
  }

  private resolveCreatureMuscleOverlap(creature: Creature): void {
    const bads = []

    for (let i = 0; i < creature.muscles.length; i++) {
      for (let j = i + 1; j < creature.muscles.length; j++) {
        if (
          creature.muscles[i].nodeConnection1 ==
            creature.muscles[j].nodeConnection1 &&
          creature.muscles[i].nodeConnection2 ==
            creature.muscles[j].nodeConnection2
        ) {
          bads.push(i)
        } else if (
          creature.muscles[i].nodeConnection1 ==
            creature.muscles[j].nodeConnection2 &&
          creature.muscles[i].nodeConnection2 ==
            creature.muscles[j].nodeConnection1
        ) {
          bads.push(i)
        } else if (
          creature.muscles[i].nodeConnection1 ==
          creature.muscles[i].nodeConnection2
        ) {
          bads.push(i)
        }
      }
    }

    for (let i = bads.length - 1; i >= 0; i--) {
      const b = bads[i] + 0

      if (b < creature.muscles.length) {
        creature.muscles.splice(b, 1)
      }
    }
  }

  private resolveCreatureLoneNodes(creature: Creature): void {
    if (creature.nodes.length >= 3) {
      for (let i = 0; i < creature.nodes.length; i++) {
        let connections = 0
        let connectedTo = -1

        for (let j = 0; j < creature.muscles.length; j++) {
          if (
            creature.muscles[j].nodeConnection1 == i ||
            creature.muscles[j].nodeConnection2 == i
          ) {
            connections++
            connectedTo = j
          }
        }

        if (connections <= 1) {
          let newConnectionNode = this.randomInt(0, creature.nodes.length)

          while (newConnectionNode == i || newConnectionNode == connectedTo) {
            newConnectionNode = this.randomInt(0, creature.nodes.length)
          }

          this.addRandomMuscle(creature, i, newConnectionNode)
        }
      }
    }
  }

  private resolveCreatureBadAxons(creature: Creature): void {
    for (let i = 0; i < creature.nodes.length; i++) {
      const ni = creature.nodes[i]

      if (ni.axon1 >= creature.nodes.length) {
        ni.axon1 = this.randomInt(0, creature.nodes.length)
      }

      if (ni.axon2 >= creature.nodes.length) {
        ni.axon2 = this.randomInt(0, creature.nodes.length)
      }
    }

    for (let i = 0; i < creature.muscles.length; i++) {
      const mi = creature.muscles[i]

      if (mi.axon >= creature.nodes.length) {
        mi.axon = this.getNewMuscleAxon(creature.nodes.length)
      }
    }

    for (let i = 0; i < creature.nodes.length; i++) {
      const ni = creature.nodes[i]
      ni.safeInput = AXON_COUNT_BY_NODE_OPERATION_ID[ni.operation] === 0
    }

    let iterations = 0
    let didSomething = false

    while (iterations < 1000) {
      didSomething = false

      for (let i = 0; i < creature.nodes.length; i++) {
        const ni = creature.nodes[i]

        if (!ni.safeInput) {
          if (
            (AXON_COUNT_BY_NODE_OPERATION_ID[ni.operation] === 1 &&
              creature.nodes[ni.axon1].safeInput) ||
            (AXON_COUNT_BY_NODE_OPERATION_ID[ni.operation] === 2 &&
              creature.nodes[ni.axon1].safeInput &&
              creature.nodes[ni.axon2].safeInput)
          ) {
            ni.safeInput = true
            didSomething = true
          }
        }
      }

      if (!didSomething) {
        iterations = 10000
      }
    }

    for (let i = 0; i < creature.nodes.length; i++) {
      const ni = creature.nodes[i]

      if (!ni.safeInput) {
        // This node doesn't get its input from a safe place.  CLEANSE IT.
        ni.operation = NodeOperationId.Constant
        ni.value = this.randomFloat(0, 1)
      }
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

  private reducedRandomForMutation(): number {
    return Math.pow(this.randomFloat(-1, 1), 19)
  }

  private getNewMuscleAxon(nodeNum: number): number {
    if (this.randomFloat(0, 1) < 0.5) {
      return this.randomInt(0, nodeNum)
    } else {
      return -1
    }
  }

  private randomFloat(minInclusive: number, maxExclusive: number): number {
    return this.config.randomFloatFn(minInclusive, maxExclusive)
  }

  private randomInt(minInclusive: number, maxExclusive: number): number {
    return toInt(this.randomFloat(minInclusive, maxExclusive))
  }
}
