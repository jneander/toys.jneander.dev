import Fitness from './Fitness';

export default class ArrayMatch {
  constructor (config) {
    this.config = config;
  }

  getFitness (current, target) {
    let fitness = 0;
    const geneLength = current.getLength();
    for (let i = 0; i < geneLength; i++) {
      fitness = current.getGene(i) === target.getGene(i) ? fitness + 1 : fitness;
    }
    return new Fitness(fitness);
  }

  getTargetFitness (target) {
    return new Fitness(target.genes.length);
  }
}
