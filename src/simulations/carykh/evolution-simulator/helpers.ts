import type Creature from './Creature'
import type Node from './Node'
import {CREATURE_COUNT} from './constants'
import type {RandomNumberFn} from './types'

export function averagePositionOfNodes(nodes: Node[]): {
  averageX: number
  averageY: number
} {
  let averageX = 0
  let averageY = 0

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    averageX += node.positionX
    averageY += node.positionY
  }

  averageX = averageX / nodes.length
  averageY = averageY / nodes.length

  return {averageX, averageY}
}

export function creatureIdToIndex(creatureId: number): number {
  return (creatureId - 1) % CREATURE_COUNT
}

export function randomArrayValue<T>(
  array: T[],
  randomUint32Fn: RandomNumberFn
): T {
  return array[randomUint32Fn(0, array.length)]
}

export function speciesIdForCreature(creature: Creature): number {
  return (creature.nodes.length % 10) * 10 + (creature.muscles.length % 10)
}
