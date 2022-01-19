import type Muscle from '../Muscle'
import type Node from '../Node'
import {AIR_FRICTION} from '../constants'
import {dist2d} from '../math'

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
