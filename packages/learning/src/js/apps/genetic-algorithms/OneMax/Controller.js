import Chromosome from 'genetics/Chromosome';
import ArrayMatch from 'genetics/fitness/ArrayMatch';
import { generateParent } from 'genetics/generation';
import TextArray from 'genetics/generation/TextArray';
import { replaceOneGene } from 'genetics/mutation';
import { sample } from 'genetics/util';

import BaseController from '../shared/Controller';

const defaultLength = 150;
const geneSet = ['0', '1'];

export default class Controller extends BaseController {
  constructor (state) {
    super(state);

    this.fitnessMethod = new ArrayMatch();
  }

  generateParent () {
    return generateParent(this.target().genes.length, geneSet, this.getFitness);
  }

  geneSet () {
    return geneSet;
  }

  propogationOptions () {
    return {
      mutate: (parent, iterationCount) => replaceOneGene(parent, this.geneSet(), this.getFitness, iterationCount),
    }
  }

  randomTarget () {
    const generator = new TextArray(geneSet, this.fitnessMethod);
    const target = generator.generateTargetWithLength(defaultLength);

    // const genes = sample(this.geneSet(), defaultLength).sort((a, b) => a - b);
    // const target = new Chromosome(genes, null);
    target.fitness = this.fitnessMethod.getTargetFitness(target);
    return target;
  }
}
