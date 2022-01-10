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

export default class Simulation {
  config: SimulationConfig
  state: SimulationState

  constructor(state: SimulationState, config: SimulationConfig) {
    this.config = config
    this.state = state

    this.randomFloat = this.randomFloat.bind(this)
    this.randomInt = this.randomInt.bind(this)
  }

  generateCreature(id: number): Creature {
    const nodes: Node[] = []
    const muscles: Muscle[] = []

    const nodeNum = toInt(this.randomFloat(3, 6))
    const muscleNum = toInt(this.randomFloat(nodeNum - 1, nodeNum * 3 - 6))

    for (let i = 0; i < nodeNum; i++) {
      nodes.push(
        new Node(
          this.randomFloat(-1, 1),
          this.randomFloat(-1, 1),
          0,
          0,
          0.4,
          this.randomFloat(0, 1),
          this.randomFloat(0, 1),
          randomArrayValue(NODE_OPERATION_IDS, this.randomInt),
          Math.floor(this.randomFloat(0, nodeNum)),
          Math.floor(this.randomFloat(0, nodeNum))
        )
      ) // replaced all nodes' sizes with 0.4, used to be random(0.1,1), random(0,1)
    }

    for (let i = 0; i < muscleNum; i++) {
      const taxon = this.getNewMuscleAxon(nodeNum)

      let tc1 = 0
      let tc2 = 0

      if (i < nodeNum - 1) {
        tc1 = i
        tc2 = i + 1
      } else {
        tc1 = toInt(this.randomFloat(0, nodeNum))
        tc2 = tc1

        while (tc2 == tc1) {
          tc2 = toInt(this.randomFloat(0, nodeNum))
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
      ni.vx = 0
      ni.vy = 0
    }
  }

  adjustNodesToCenter(nodes: Node[]): void {
    let avx = 0
    let lowY = -1000

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      avx += ni.x

      if (ni.y + ni.m / 2 > lowY) {
        lowY = ni.y + ni.m / 2
      }
    }

    avx /= nodes.length

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      ni.x -= avx
      ni.y -= lowY
    }
  }

  applyForceToMuscle(muscle: Muscle, nodes: Node[]): void {
    let target = muscle.previousTarget

    if (muscle.axon >= 0 && muscle.axon < nodes.length) {
      target = muscle.len * nodes[muscle.axon].getClampedValue()
    } else {
      target = muscle.len
    }

    const ni1 = nodes[muscle.c1]
    const ni2 = nodes[muscle.c2]

    const distance = dist2d(ni1.x, ni1.y, ni2.x, ni2.y)
    const angle = Math.atan2(ni1.y - ni2.y, ni1.x - ni2.x)

    const force = Math.min(Math.max(1 - distance / target, -0.4), 0.4)
    ni1.vx += (Math.cos(angle) * force * muscle.rigidity) / ni1.m
    ni1.vy += (Math.sin(angle) * force * muscle.rigidity) / ni1.m
    ni2.vx -= (Math.cos(angle) * force * muscle.rigidity) / ni2.m
    ni2.vy -= (Math.sin(angle) * force * muscle.rigidity) / ni2.m

    this.state.creature.energyUsed = Math.max(
      this.state.creature.energyUsed +
        Math.abs(muscle.previousTarget - target) *
          muscle.rigidity *
          ENERGY_UNIT,
      0
    )

    muscle.previousTarget = target
  }

  applyForcesToNode(node: Node): void {
    node.vx *= AIR_FRICTION
    node.vy *= AIR_FRICTION
    node.y += node.vy
    node.x += node.vx
    const acc = dist2d(node.vx, node.vy, node.pvx, node.pvy)
    this.state.creature.totalNodeNausea += acc * acc * NAUSEA_UNIT
    node.pvx = node.vx
    node.pvy = node.vy
  }

  applyGravityToNode(node: Node): void {
    node.vy += GRAVITY
  }

  applyCollisionsToNode(node: Node): void {
    node.pressure = 0
    let dif = node.y + node.m / 2

    if (dif >= 0) {
      this.pressNodeAgainstGround(node, 0)
    }

    if (node.y > node.prevY && this.config.hazelStairs >= 0) {
      const bottomPointNow = node.y + node.m / 2
      const bottomPointPrev = node.prevY + node.m / 2
      const levelNow = toInt(
        Math.ceil(bottomPointNow / this.config.hazelStairs)
      )
      const levelPrev = toInt(
        Math.ceil(bottomPointPrev / this.config.hazelStairs)
      )

      if (levelNow > levelPrev) {
        const groundLevel = levelPrev * this.config.hazelStairs
        this.pressNodeAgainstGround(node, groundLevel)
      }
    }

    node.prevY = node.y
    node.prevX = node.x
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

  modifyMuscle(muscle: Muscle, nodeCount: number, mutability: number): Muscle {
    let newc1 = muscle.c1
    let newc2 = muscle.c2
    let newAxon = muscle.axon

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newc1 = toInt(this.randomFloat(0, nodeCount))
    }

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newc2 = toInt(this.randomFloat(0, nodeCount))
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
      Math.max(muscle.len + this.reducedRandomForMutation() * mutability, 0.4),
      1.25
    )

    return new Muscle(newAxon, newc1, newc2, newLen, newR)
  }

  modifyNode(node: Node, mutability: number, nodeNum: number): Node {
    const newX = node.x + this.reducedRandomForMutation() * 0.5 * mutability
    const newY = node.y + this.reducedRandomForMutation() * 0.5 * mutability
    let newM = node.m + this.reducedRandomForMutation() * 0.1 * mutability

    newM = Math.min(Math.max(newM, 0.3), 0.5)
    newM = 0.4

    let newV =
      node.value * (1 + this.reducedRandomForMutation() * 0.2 * mutability)
    let newOperation = node.operation
    let newAxon1 = node.axon1
    let newAxon2 = node.axon2

    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newOperation = randomArrayValue(NODE_OPERATION_IDS, this.randomInt)
    }
    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon1 = toInt(this.randomFloat(0, nodeNum))
    }
    if (this.randomFloat(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon2 = toInt(this.randomFloat(0, nodeNum))
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
      newM,
      Math.min(
        Math.max(
          node.f + this.reducedRandomForMutation() * 0.1 * mutability,
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

  processNodeAxons(node: Node, nodes: Node[]): void {
    const axonValue1 = nodes[node.axon1].value
    const axonValue2 = nodes[node.axon2].value

    if (node.operation === NodeOperationId.Constant) {
      // constant
    } else if (node.operation === NodeOperationId.TimeInSeconds) {
      // time
      node.valueToBe = this.state.timer / 60.0
    } else if (node.operation === NodeOperationId.NodePositionXFifthed) {
      // x - coordinate
      node.valueToBe = node.x * 0.2
    } else if (
      node.operation === NodeOperationId.NegativeNodePositionYFifthed
    ) {
      // node.y - coordinate
      node.valueToBe = -node.y * 0.2
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

  addRandomNode(creature: Creature): void {
    const parentNode = Math.floor(this.randomFloat(0, creature.nodes.length))
    const ang1 = this.randomFloat(0, 2 * Math.PI)
    const distance = Math.sqrt(this.randomFloat(0, 1))
    const x = creature.nodes[parentNode].x + Math.cos(ang1) * 0.5 * distance
    const y = creature.nodes[parentNode].y + Math.sin(ang1) * 0.5 * distance

    const newNodeCount = creature.nodes.length + 1

    creature.nodes.push(
      new Node(
        x,
        y,
        0,
        0,
        0.4,
        this.randomFloat(0, 1),
        this.randomFloat(0, 1),
        randomArrayValue(NODE_OPERATION_IDS, this.randomInt),
        Math.floor(this.randomFloat(0, newNodeCount)),
        Math.floor(this.randomFloat(0, newNodeCount))
      )
    )

    let nextClosestNode = 0
    let record = 100000

    for (let i = 0; i < creature.nodes.length - 1; i++) {
      if (i != parentNode) {
        const dx = creature.nodes[i].x - x
        const dy = creature.nodes[i].y - y

        if (Math.sqrt(dx * dx + dy * dy) < record) {
          record = Math.sqrt(dx * dx + dy * dy)
          nextClosestNode = i
        }
      }
    }

    this.addRandomMuscle(creature, parentNode, creature.nodes.length - 1)
    this.addRandomMuscle(creature, nextClosestNode, creature.nodes.length - 1)
  }

  addRandomMuscle(creature: Creature, tc1: number, tc2: number): void {
    const axon = this.getNewMuscleAxon(creature.nodes.length)

    if (tc1 == -1) {
      tc1 = toInt(this.randomFloat(0, creature.nodes.length))
      tc2 = tc1

      while (tc2 == tc1 && creature.nodes.length >= 2) {
        tc2 = toInt(this.randomFloat(0, creature.nodes.length))
      }
    }

    let len = this.randomFloat(
      MIN_MUSCLE_LENGTH_INCLUSIVE,
      MAX_MUSCLE_LENGTH_INCLUSIVE
    )

    if (tc1 != -1) {
      len = dist2d(
        creature.nodes[tc1].x,
        creature.nodes[tc1].y,
        creature.nodes[tc2].x,
        creature.nodes[tc2].y
      )
    }

    creature.muscles.push(
      new Muscle(axon, tc1, tc2, len, this.randomFloat(0.02, 0.08))
    )
  }

  removeRandomNode(creature: Creature): void {
    const choice = Math.floor(this.randomFloat(0, creature.nodes.length))
    creature.nodes.splice(choice, 1)

    let i = 0

    while (i < creature.muscles.length) {
      if (
        creature.muscles[i].c1 == choice ||
        creature.muscles[i].c2 == choice
      ) {
        creature.muscles.splice(i, 1)
      } else {
        i++
      }
    }

    for (let j = 0; j < creature.muscles.length; j++) {
      if (creature.muscles[j].c1 >= choice) {
        creature.muscles[j].c1--
      }

      if (creature.muscles[j].c2 >= choice) {
        creature.muscles[j].c2--
      }
    }
  }

  removeRandomMuscle(creature: Creature): void {
    const choice = Math.floor(this.randomFloat(0, creature.muscles.length))
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
          creature.muscles[i].c1 == creature.muscles[j].c1 &&
          creature.muscles[i].c2 == creature.muscles[j].c2
        ) {
          bads.push(i)
        } else if (
          creature.muscles[i].c1 == creature.muscles[j].c2 &&
          creature.muscles[i].c2 == creature.muscles[j].c1
        ) {
          bads.push(i)
        } else if (creature.muscles[i].c1 == creature.muscles[i].c2) {
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
          if (creature.muscles[j].c1 == i || creature.muscles[j].c2 == i) {
            connections++
            connectedTo = j
          }
        }

        if (connections <= 1) {
          let newConnectionNode = Math.floor(
            this.randomFloat(0, creature.nodes.length)
          )

          while (newConnectionNode == i || newConnectionNode == connectedTo) {
            newConnectionNode = Math.floor(
              this.randomFloat(0, creature.nodes.length)
            )
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
        ni.axon1 = toInt(this.randomFloat(0, creature.nodes.length))
      }

      if (ni.axon2 >= creature.nodes.length) {
        ni.axon2 = toInt(this.randomFloat(0, creature.nodes.length))
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
    const dif = node.y - (groundY - node.m / 2)
    node.pressure += dif * PRESSURE_UNIT
    node.y = groundY - node.m / 2
    node.vy = 0
    node.x -= node.vx * node.f

    if (node.vx > 0) {
      node.vx -= node.f * dif * FRICTION
      if (node.vx < 0) {
        node.vx = 0
      }
    } else {
      node.vx += node.f * dif * FRICTION
      if (node.vx > 0) {
        node.vx = 0
      }
    }
  }

  private reducedRandomForMutation(): number {
    return Math.pow(this.randomFloat(-1, 1), 19)
  }

  private getNewMuscleAxon(nodeNum: number): number {
    if (this.randomFloat(0, 1) < 0.5) {
      return toInt(this.randomFloat(0, nodeNum))
    } else {
      return -1
    }
  }

  private randomFloat(minInclusive: number, maxExclusive: number): number {
    return this.config.randomFloatFn(minInclusive, maxExclusive)
  }

  private randomInt(minInclusive: number, maxExclusive: number): number {
    return Math.floor(this.randomFloat(minInclusive, maxExclusive))
  }
}
