import type Node from '../Node'

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
