import {
  ArrayMatch,
  generateParent,
  replaceOneGene,
  Chromosome,
  Fitness
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'
import TextArray from './TextArray'

const defaultLength = 150
const geneSet = ['0', '1']

export default class Controller extends BaseController<string, number> {
  private fitnessMethod: ArrayMatch<string>

  constructor() {
    super()

    this.fitnessMethod = new ArrayMatch()
  }

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string, number> {
    return generateParent<string, number>(
      this.target()!.genes.length,
      geneSet,
      this.getFitness
    )
  }

  protected propogationOptions(): PropagationOptions<string, number> {
    return {
      mutate: (parent: Chromosome<string, number>, iterationCount: number) =>
        replaceOneGene(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  protected randomTarget(): Chromosome<string, number> {
    const generator = new TextArray(geneSet)
    const target = generator.generateTargetWithLength(defaultLength)

    // const genes = sample(this.geneSet(), defaultLength).sort((a, b) => a - b);
    // const target = new Chromosome(genes, null);
    target.fitness = this.fitnessMethod.getTargetFitness(target)
    return target
  }

  protected getFitness(
    chromosome: Chromosome<string, number>
  ): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome, this.target()!)
  }
}
