import {ArrayMatch, Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {BaseController, PropagationTarget, State} from '../shared'
import {TextArray} from './text-array'

const defaultLength = 150
const geneSet = ['0', '1']

function randomTarget(fitnessMethod: ArrayMatch<string>): PropagationTarget<string, number> {
  const generator = new TextArray(geneSet)
  const chromosome = generator.generateTargetWithLength(defaultLength)

  return {
    chromosome,
    fitness: fitnessMethod.getTargetFitness(chromosome),
  }
}

export class Controller extends BaseController<string, number> {
  private fitnessMethod: ArrayMatch<string>

  constructor() {
    const optimalFitness = new ArrayMatch<string>()

    const store = new Store<State<string, number>>({
      allIterations: false,
      best: null,
      current: null,
      first: null,
      isRunning: false,
      iterationCount: 0,
      maxPropagationSpeed: true,
      playbackPosition: 1,
      propagationSpeed: 1,
      target: randomTarget(optimalFitness),
    })

    super(store)

    this.fitnessMethod = optimalFitness

    this.randomizeTarget = this.randomizeTarget.bind(this)
  }

  randomizeTarget(): void {
    this.store.setState({
      target: this.randomTarget(),
    })

    this.reset()
  }

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string> {
    const {chromosome} = this.target()

    if (chromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return randomChromosome<string>(chromosome.genes.length, geneSet)
  }

  protected propogationOptions() {
    return {
      mutate: (parent: Chromosome<string>) => replaceOneGene(parent, this.geneSet()),
      optimalFitness: this.target().fitness,
    }
  }

  protected randomTarget(): PropagationTarget<string, number> {
    const generator = new TextArray(geneSet)
    const chromosome = generator.generateTargetWithLength(defaultLength)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
    }
  }

  protected getFitness(chromosome: Chromosome<string>): Fitness<number> {
    const {chromosome: targetChromosome} = this.target()

    if (targetChromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return this.fitnessMethod.getFitness(chromosome, targetChromosome)
  }

  private target(): PropagationTarget<string, number> {
    return this.store.getState().target
  }
}
