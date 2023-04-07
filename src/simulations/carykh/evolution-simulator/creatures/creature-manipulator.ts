import type {RandomNumberGenerator} from '@jneander/utils-random'

import {
  BIG_MUTATION_CHANCE,
  MAX_MUSCLE_LENGTH_INCLUSIVE,
  MIN_MUSCLE_LENGTH_INCLUSIVE,
  NODE_MASS_DEFAULT,
} from '../constants'
import {Creature} from '../creatures'
import {dist2d} from '../math'
import Muscle from './Muscle'
import Node from './Node'
import {applyForceToMuscle, applyForcesToNode, positionNodesCenterToOrigin} from './helpers'
import {
  AXON_COUNT_BY_NODE_OPERATION_ID,
  NODE_OPERATION_IDS,
  NodeOperationId,
} from './node-operations'

export type CreatureManipulatorConfig = {
  randomNumberGenerator: RandomNumberGenerator
}

export class CreatureManipulator {
  private config: CreatureManipulatorConfig

  constructor(config: CreatureManipulatorConfig) {
    this.config = config

    this.randomFract = this.randomFract.bind(this)
    this.randomUint32 = this.randomUint32.bind(this)
  }

  generateCreature(id: number): Creature {
    const nodes: Node[] = []
    const muscles: Muscle[] = []

    const nodeNum = this.randomUint32(3, 6)
    const muscleNum = this.randomUint32(nodeNum - 1, nodeNum * 3 - 6)

    for (let i = 0; i < nodeNum; i++) {
      nodes.push(
        new Node(
          this.randomFract(-1, 1),
          this.randomFract(-1, 1),
          0,
          0,
          NODE_MASS_DEFAULT,
          this.randomFract(0, 1),
          this.randomFract(0, 1),
          this.randomArrayValue(NODE_OPERATION_IDS),
          this.randomUint32(0, nodeNum),
          this.randomUint32(0, nodeNum),
        ),
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
        tc1 = this.randomUint32(0, nodeNum)
        tc2 = tc1

        while (tc2 == tc1) {
          tc2 = this.randomUint32(0, nodeNum)
        }
      }

      const len = this.randomFract(MIN_MUSCLE_LENGTH_INCLUSIVE, MAX_MUSCLE_LENGTH_INCLUSIVE)

      muscles.push(new Muscle(taxon, tc1, tc2, len, this.randomFract(0.02, 0.08)))
    }

    this.stabilizeNodesAndMuscles(nodes, muscles)
    positionNodesCenterToOrigin(nodes)

    const heartbeat = this.randomFract(40, 80)
    const creature = new Creature(id, nodes, muscles, 0, true, heartbeat, 1.0)

    this.resolveCreatureIssues(creature)

    return creature
  }

  modifyCreature(creature: Creature, id: number): Creature {
    const modifiedCreature = new Creature(
      id,
      [],
      [],
      0,
      true,
      creature.creatureTimer + this.reducedRandomForMutation() * 16 * creature.mutability,
      Math.min(creature.mutability * this.randomFract(0.8, 1.25), 2),
    )

    for (let i = 0; i < creature.nodes.length; i++) {
      modifiedCreature.nodes.push(
        this.modifyNode(creature.nodes[i], creature.mutability, creature.nodes.length),
      )
    }

    for (let i = 0; i < creature.muscles.length; i++) {
      const muscle = this.modifyMuscle(
        creature.muscles[i],
        creature.nodes.length,
        creature.mutability,
      )
      modifiedCreature.muscles.push(muscle)
    }

    if (
      this.randomFract(0, 1) < BIG_MUTATION_CHANCE * creature.mutability ||
      creature.nodes.length <= 2
    ) {
      // Add a node
      this.addRandomNode(modifiedCreature)
    }

    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * creature.mutability) {
      // Add a muscle
      this.addRandomMuscle(modifiedCreature, -1, -1)
    }

    if (
      this.randomFract(0, 1) < BIG_MUTATION_CHANCE * creature.mutability &&
      modifiedCreature.nodes.length >= 4
    ) {
      // Remove a node
      this.removeRandomNode(modifiedCreature)
    }

    if (
      this.randomFract(0, 1) < BIG_MUTATION_CHANCE * creature.mutability &&
      modifiedCreature.muscles.length >= 2
    ) {
      // Remove a muscle
      this.removeRandomMuscle(modifiedCreature)
    }

    this.resolveCreatureIssues(modifiedCreature)

    // Stabilize and adjust mutated offspring
    const {muscles, nodes} = modifiedCreature

    this.stabilizeNodesAndMuscles(nodes, muscles)
    positionNodesCenterToOrigin(nodes)

    return modifiedCreature
  }

  private modifyMuscle(muscle: Muscle, nodeCount: number, mutability: number): Muscle {
    let newc1 = muscle.nodeConnection1
    let newc2 = muscle.nodeConnection2
    let newAxon = muscle.axon

    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newc1 = this.randomUint32(0, nodeCount)
    }

    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newc2 = this.randomUint32(0, nodeCount)
    }

    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon = this.getNewMuscleAxon(nodeCount)
    }

    const newR = Math.min(
      Math.max(muscle.rigidity * (1 + this.reducedRandomForMutation() * 0.9 * mutability), 0.01),
      0.08,
    )
    const newLen = Math.min(
      Math.max(muscle.length + this.reducedRandomForMutation() * mutability, 0.4),
      1.25,
    )

    return new Muscle(newAxon, newc1, newc2, newLen, newR)
  }

  private modifyNode(node: Node, mutability: number, nodeNum: number): Node {
    const newX = node.positionX + this.reducedRandomForMutation() * 0.5 * mutability
    const newY = node.positionY + this.reducedRandomForMutation() * 0.5 * mutability

    let newV = node.value * (1 + this.reducedRandomForMutation() * 0.2 * mutability)
    let newOperation = node.operation
    let newAxon1 = node.axon1
    let newAxon2 = node.axon2

    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newOperation = this.randomArrayValue(NODE_OPERATION_IDS)
    }
    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon1 = this.randomUint32(0, nodeNum)
    }
    if (this.randomFract(0, 1) < BIG_MUTATION_CHANCE * mutability) {
      newAxon2 = this.randomUint32(0, nodeNum)
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
      Math.min(Math.max(node.friction + this.reducedRandomForMutation() * 0.1 * mutability, 0), 1),
      newV,
      newOperation,
      newAxon1,
      newAxon2,
    )
  }

  private addRandomNode(creature: Creature): void {
    const parentNode = this.randomUint32(0, creature.nodes.length)
    const ang1 = this.randomFract(0, 2 * Math.PI)
    const distance = Math.sqrt(this.randomFract(0, 1))
    const x = creature.nodes[parentNode].positionX + Math.cos(ang1) * 0.5 * distance
    const y = creature.nodes[parentNode].positionY + Math.sin(ang1) * 0.5 * distance

    const newNodeCount = creature.nodes.length + 1

    creature.nodes.push(
      new Node(
        x,
        y,
        0,
        0,
        NODE_MASS_DEFAULT,
        this.randomFract(0, 1),
        this.randomFract(0, 1),
        this.randomArrayValue(NODE_OPERATION_IDS),
        this.randomUint32(0, newNodeCount),
        this.randomUint32(0, newNodeCount),
      ),
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
      tc1 = this.randomUint32(0, creature.nodes.length)
      tc2 = tc1

      while (tc2 == tc1 && creature.nodes.length >= 2) {
        tc2 = this.randomUint32(0, creature.nodes.length)
      }
    }

    let len = this.randomFract(MIN_MUSCLE_LENGTH_INCLUSIVE, MAX_MUSCLE_LENGTH_INCLUSIVE)

    if (tc1 != -1) {
      len = dist2d(
        creature.nodes[tc1].positionX,
        creature.nodes[tc1].positionY,
        creature.nodes[tc2].positionX,
        creature.nodes[tc2].positionY,
      )
    }

    creature.muscles.push(new Muscle(axon, tc1, tc2, len, this.randomFract(0.02, 0.08)))
  }

  private removeRandomNode(creature: Creature): void {
    const choice = this.randomUint32(0, creature.nodes.length)
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
    const choice = this.randomUint32(0, creature.muscles.length)
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
          creature.muscles[i].nodeConnection1 == creature.muscles[j].nodeConnection1 &&
          creature.muscles[i].nodeConnection2 == creature.muscles[j].nodeConnection2
        ) {
          bads.push(i)
        } else if (
          creature.muscles[i].nodeConnection1 == creature.muscles[j].nodeConnection2 &&
          creature.muscles[i].nodeConnection2 == creature.muscles[j].nodeConnection1
        ) {
          bads.push(i)
        } else if (creature.muscles[i].nodeConnection1 == creature.muscles[i].nodeConnection2) {
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
          let newConnectionNode = this.randomUint32(0, creature.nodes.length)

          while (newConnectionNode == i || newConnectionNode == connectedTo) {
            newConnectionNode = this.randomUint32(0, creature.nodes.length)
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
        ni.axon1 = this.randomUint32(0, creature.nodes.length)
      }

      if (ni.axon2 >= creature.nodes.length) {
        ni.axon2 = this.randomUint32(0, creature.nodes.length)
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
        ni.value = this.randomFract(0, 1)
      }
    }
  }

  private stabilizeNodesAndMuscles(nodes: Node[], muscles: Muscle[]): void {
    for (let j = 0; j < 200; j++) {
      for (let i = 0; i < muscles.length; i++) {
        applyForceToMuscle(muscles[i], nodes)
      }

      for (let i = 0; i < nodes.length; i++) {
        applyForcesToNode(nodes[i])
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      ni.velocityX = 0
      ni.velocityY = 0
    }
  }

  private reducedRandomForMutation(): number {
    return Math.pow(this.randomFract(-1, 1), 19)
  }

  private getNewMuscleAxon(nodeNum: number): number {
    if (this.randomFract(0, 1) < 0.5) {
      return this.randomUint32(0, nodeNum)
    } else {
      return -1
    }
  }

  private randomFract(minInclusive: number, maxExclusive: number): number {
    const range = maxExclusive - minInclusive

    let randomFract

    if (range < 1) {
      randomFract = this.config.randomNumberGenerator.nextFract32(0, range)
    } else {
      /*
       * The original `nextFract32` method preserves bit fidelity by limiting
       * the value to 32-bit fractions. To generate random fractions outside
       * this range, the result must be scaled. To minimize the loss of fidelity
       * while scaling, scale the range down to the highest value less than 1
       * using a power of 2. Then scale the generated fraction back up using the
       * same power of 2.
       */

      const scale = 2 ** Math.ceil(Math.log2(range))

      randomFract = this.config.randomNumberGenerator.nextFract32(0, range / scale)
      randomFract *= scale
    }

    return randomFract + minInclusive
  }

  private randomUint32(minInclusive: number, maxExclusive: number): number {
    return this.config.randomNumberGenerator.nextUint32(minInclusive, maxExclusive)
  }

  private randomArrayValue<T>(array: T[]): T {
    return array[this.randomUint32(0, array.length)]
  }
}
