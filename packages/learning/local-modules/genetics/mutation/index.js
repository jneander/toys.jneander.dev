import Chromosome from 'genetics/Chromosome';
import { randomInt, range, sample } from 'genetics/util';

export function replaceOneGene (parent, geneSet, getFitness, iteration) {
  const index = randomInt(0, parent.genes.length);
  const childGenes = [...parent.genes];
  const [newGene, alternate] = sample(geneSet, 2);

  if (childGenes[index] === newGene) {
    childGenes[index] = alternate;
  } else {
    childGenes[index] = newGene;
  }

  const chromosome = new Chromosome(childGenes, iteration);
  chromosome.fitness = getFitness(chromosome);
  return chromosome;
}

export function swapTwoGenes (parent, geneSet, getFitness, iteration, times = 1) {
  const childGenes = [...parent.genes];

  let mutations = times;
  while (mutations > 0) {
    mutations--;
    const [indexA, indexB] = sample(range(0, parent.genes.length), 2);
    childGenes[indexA] = parent.genes[indexB];
    childGenes[indexB] = parent.genes[indexA];
  }

  const chromosome = new Chromosome(childGenes, iteration);
  chromosome.fitness = getFitness(chromosome);
  return chromosome;
}
