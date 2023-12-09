import type {Chromosome, Fitness} from '@jneander/genetics'

import {product, sum} from '../../shared/utils'
import type {CardSplittingFitnessValue} from './types'

function convertGene(gene: string): number {
  return gene === 'A' ? 1 : parseInt(gene, 10)
}

class CardSplittingFitness implements Fitness<CardSplittingFitnessValue> {
  public value: CardSplittingFitnessValue

  constructor(sum: number, product: number, duplicates: number) {
    const sumDifference = Math.abs(36 - sum)
    const productDifference = Math.abs(360 - product)
    const difference = sumDifference + productDifference

    this.value = {difference, duplicates}
  }

  isEqualTo(fitness: Fitness<CardSplittingFitnessValue>) {
    return (
      this.value.duplicates === fitness.value.duplicates &&
      this.value.difference === fitness.value.difference
    )
  }

  isGreaterThan(fitness: Fitness<CardSplittingFitnessValue>) {
    return this.value.duplicates !== fitness.value.duplicates
      ? this.value.duplicates < fitness.value.duplicates
      : this.value.difference < fitness.value.difference
  }

  isLessThan(fitness: Fitness<CardSplittingFitnessValue>) {
    return this.value.duplicates !== fitness.value.duplicates
      ? this.value.duplicates > fitness.value.duplicates
      : this.value.difference > fitness.value.difference
  }

  toString() {
    return `${this.value.duplicates},${-this.value.difference}`
  }

  valueOf(): CardSplittingFitnessValue {
    return this.value
  }
}

export class SumProductMatch {
  getFitness(chromosome: Chromosome<string>): CardSplittingFitness {
    const groupSum = sum(chromosome.genes.slice(0, 5).map(convertGene))
    const groupProduct = product(chromosome.genes.slice(5, 10).map(convertGene))
    const difference = chromosome.genes.length - new Set(chromosome.genes).size

    return new CardSplittingFitness(groupSum, groupProduct, difference)
  }

  getTargetFitness(): CardSplittingFitness {
    return new CardSplittingFitness(36, 360, 0)
  }
}
