import {Chromosome, Fitness, PropagationRecord} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {
  ControlledPropagation,
  ControlledPropagationConfig,
  PropagationListener,
  PropagationRecording
} from './propagation'
import {State} from './types'

export default abstract class Controller<GeneType, FitnessValueType> {
  public store: Store<State<GeneType, FitnessValueType>>

  private listener: PropagationListener
  private recording: PropagationRecording<GeneType, FitnessValueType>
  private propagation: ControlledPropagation<GeneType, FitnessValueType> | null

  constructor() {
    this.store = new Store<State<GeneType, FitnessValueType>>({
      allIterations: false,
      best: null,
      current: null,
      first: null,
      isRunning: false,
      iterationCount: 0,
      playbackPosition: 1,
      target: this.randomTarget()
    })

    this.listener = new PropagationListener(this.updateView.bind(this))
    this.recording = new PropagationRecording()
    this.propagation = null

    this.getFitness = this.getFitness.bind(this)
    this.randomizeTarget = this.randomizeTarget.bind(this)
    this.setPlaybackPosition = this.setPlaybackPosition.bind(this)
    this.setRecordAllIterations = this.setRecordAllIterations.bind(this)
    this.state = this.state.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  getInitialState() {
    return {
      allIterations: false,
      isRunning: false,
      iterationCount: 0,
      playbackPosition: 1
    }
  }

  initialize(): void {
    this.randomizeTarget()
  }

  onFinish(): void {
    this.listener.stop()
    this.updateView()
  }

  randomizeTarget(): void {
    this.setTarget(this.randomTarget())
  }

  setPlaybackPosition(playbackPosition: number): void {
    this.recording.setPlaybackPosition(playbackPosition)
    this.updateView()
  }

  setTarget(chromosome: PropagationRecord<GeneType, FitnessValueType>): void {
    this.store.setState({
      target: chromosome
    })

    this.createPropagation()
    this.recording.reset()
    this.updateView()
  }

  setRecordAllIterations(allIterations: boolean): void {
    this.createPropagation()
    this.recording.configure({allIterations})
    this.recording.reset()
    this.updateView()
  }

  start(): void {
    if (this.propagation?.isRunning()) {
      return
    }

    if (this.propagation?.isFinished()) {
      this.createPropagation()
      this.recording.reset()
      this.updateView()
    }

    this.listener.start()
    this.propagation?.start()
  }

  stop(): void {
    this.propagation?.stop()
    this.listener.stop()
    this.updateView()
  }

  target(): PropagationRecord<GeneType, FitnessValueType> {
    return this.store.getState().target
  }

  updateView(): void {
    this.store.setState({
      allIterations: this.recording.isRecordingAllIterations(),
      best: this.recording.best(),
      current: this.recording.current(),
      first: this.recording.first(),
      isRunning: !!this.propagation && this.propagation.isRunning(),
      iterationCount: this.propagation ? this.propagation.iterationCount() : 0,
      playbackPosition: this.recording.playbackPosition(),
      target: this.target(),
      ...this.state()
    })
  }

  protected state() {
    return {}
  }

  protected abstract geneSet(): GeneType[]
  protected abstract generateParent(): Chromosome<GeneType>
  protected abstract getFitness(
    chromosome: Chromosome<GeneType>
  ): Fitness<FitnessValueType>
  protected abstract propogationOptions(): {
    mutate: ControlledPropagationConfig<GeneType, FitnessValueType>['mutate']
  }
  protected abstract randomTarget(): PropagationRecord<
    GeneType,
    FitnessValueType
  >

  private createPropagation(): void {
    this.propagation = new ControlledPropagation({
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      onFinish: this.onFinish.bind(this),
      onImprovement: chromosome => {
        this.recording.addImprovement(chromosome)
      },
      onIteration: chromosome => {
        this.recording.addIteration(chromosome)
      },
      optimalFitness: this.target()!.fitness,
      ...this.propogationOptions()
    })
  }
}
