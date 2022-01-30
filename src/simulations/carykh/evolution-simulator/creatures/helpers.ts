import {AIR_FRICTION, CREATURE_COUNT} from '../constants'
import {dist2d} from '../math'
import type Creature from './Creature'
import type Muscle from './Muscle'
import type Node from './Node'

export function adjustNodesToCenter(nodes: Node[]): void {
  let averageX = 0
  let lowestY = -Infinity

  for (let i = 0; i < nodes.length; i++) {
    const ni = nodes[i]
    averageX += ni.positionX

    if (ni.positionY + ni.mass / 2 > lowestY) {
      lowestY = ni.positionY + ni.mass / 2
    }
  }

  averageX /= nodes.length

  for (let i = 0; i < nodes.length; i++) {
    const ni = nodes[i]
    ni.positionX -= averageX
    ni.positionY -= lowestY
  }
}

export function applyForceToMuscle(muscle: Muscle, nodes: Node[]): void {
  let target

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
}

export function applyForcesToNode(node: Node): void {
  node.velocityX *= AIR_FRICTION
  node.velocityY *= AIR_FRICTION
  node.positionY += node.velocityY
  node.positionX += node.velocityX
}

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

export function speciesIdForCreature(creature: Creature): number {
  return speciesIdFromNodesAndMuscles(
    creature.nodes.length,
    creature.muscles.length
  )
}

export function speciesIdFromNodesAndMuscles(
  nodeCount: number,
  muscleCount: number
): number {
  return (nodeCount % 10) * 10 + (muscleCount % 10)
}
