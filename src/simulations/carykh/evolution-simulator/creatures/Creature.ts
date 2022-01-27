import type Muscle from './Muscle'
import type Node from './Node'

export default class Creature {
  nodes: Node[]
  muscles: Muscle[]
  fitness: number
  id: number
  alive: boolean
  creatureTimer: number
  mutability: number

  constructor(
    id: number,
    nodes: Node[],
    muscles: Muscle[],
    fitness: number,
    alive: boolean,
    creatureTimer: number,
    mutability: number
  ) {
    this.id = id
    this.muscles = muscles
    this.nodes = nodes
    this.fitness = fitness
    this.alive = alive
    this.creatureTimer = creatureTimer
    this.mutability = mutability
  }

  clone(newId?: number): Creature {
    const n2 = []
    const m2 = []

    for (let i = 0; i < this.nodes.length; i++) {
      n2.push(this.nodes[i].clone())
    }

    for (let i = 0; i < this.muscles.length; i++) {
      m2.push(this.muscles[i].clone())
    }

    return new Creature(
      newId != null ? newId : this.id,
      n2,
      m2,
      this.fitness,
      this.alive,
      this.creatureTimer,
      this.mutability
    )
  }
}
