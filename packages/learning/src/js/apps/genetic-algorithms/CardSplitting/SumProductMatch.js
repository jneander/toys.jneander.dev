import Fitness from '@jneander/genetics/es/fitness/Fitness'
import {product, sum} from '@jneander/genetics/es/util'

function convertGene(gene) {
  return gene === 'A' ? 1 : parseInt(gene, 10)
}

export class CardGroupFitness extends Fitness {
  constructor(sum, product, duplicates) {
    super({duplicates})

    const sumDifference = Math.abs(36 - sum)
    const productDifference = Math.abs(360 - product)
    this.value.difference = sumDifference + productDifference
  }

  isEqualTo(fitness) {
    return this.value.duplicates === fitness.value.duplicates && this.value.difference === fitness.value.difference
  }

  isGreaterThan(fitness) {
    return this.value.duplicates !== fitness.value.duplicates
      ? this.value.duplicates < fitness.value.duplicates
      : this.value.difference < fitness.value.difference
  }

  isLessThan(fitness) {
    return this.value.duplicates !== fitness.value.duplicates
      ? this.value.duplicates > fitness.value.duplicates
      : this.value.difference > fitness.value.difference
  }

  toString() {
    return `${this.value.duplicates},${-this.value.difference}`
  }
}

export default class SumProductMatch {
  constructor(config) {
    this.config = config
  }

  getFitness(chromosome) {
    const groupSum = sum(chromosome.genes.slice(0, 5).map(convertGene))
    const groupProduct = product(chromosome.genes.slice(5, 10).map(convertGene))
    const difference = chromosome.genes.length - new Set(chromosome.genes).size

    return new CardGroupFitness(groupSum, groupProduct, difference)
  }

  getTargetFitness() {
    return new CardGroupFitness(36, 360, 0)
  }
}
