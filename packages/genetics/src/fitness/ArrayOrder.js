import Fitness from './Fitness'

export class OrderFitness extends Fitness {
  constructor(ordered, gap) {
    super({ordered, gap})
  }

  isEqualTo(fitness) {
    return this.value.ordered === fitness.value.ordered && this.value.gap === fitness.value.gap
  }

  isGreaterThan(fitness) {
    return this.value.ordered !== fitness.value.ordered
      ? this.value.ordered > fitness.value.ordered
      : this.value.gap < fitness.value.gap
  }

  isLessThan(fitness) {
    return this.value.ordered !== fitness.value.ordered
      ? this.value.ordered < fitness.value.ordered
      : this.value.gap > fitness.value.gap
  }

  toString() {
    return `${this.value.ordered},${-this.value.gap}`
  }
}

export default class ArrayOrder {
  constructor(config) {
    this.config = config
  }

  getFitness(current, target) {
    let fitness = 1
    let gap = 0

    for (let i = 1; i < current.genes.length; i++) {
      const [currentGene, previousGene] = [current.getGene(i), current.getGene(i - 1)]
      if (currentGene > previousGene) {
        fitness++
      } else {
        gap += previousGene - currentGene
      }
    }

    return new OrderFitness(fitness, gap)
  }

  getTargetFitness(target) {
    return new OrderFitness(target.genes.length, 0)
  }
}
