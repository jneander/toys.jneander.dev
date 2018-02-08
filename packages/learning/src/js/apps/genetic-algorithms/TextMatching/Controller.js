import Chromosome from 'genetics/Chromosome';
import ArrayOrder from 'genetics/fitness/ArrayOrder';
import { generateParent } from 'genetics/generation';
import { replaceOneGene } from 'genetics/mutation';
import { sample } from 'genetics/util';

import ArrayMatch from 'genetics/fitness/ArrayMatch';

import BaseController from '../shared/Controller';

const defaultLength = 50;
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split('');

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
    const genes = sample(this.geneSet(), defaultLength).sort((a, b) => a - b);
    const target = new Chromosome(genes, null);
    target.fitness = this.fitnessMethod.getTargetFitness(target);
    return target;
  }
}
