import Chromosome from '../Chromosome'
import {sample} from '../util'

export function generateParent(length, geneSet, getFitness) {
  let genes = []
  while (genes.length < length) {
    const sampleSize = Math.min(length - genes.length, geneSet.length)
    genes = genes.concat(sample(geneSet, sampleSize))
  }

  const chromosome = new Chromosome(genes, 1)
  chromosome.fitness = getFitness(chromosome)
  return chromosome
}
