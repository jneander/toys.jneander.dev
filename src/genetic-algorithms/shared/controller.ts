import {Chromosome, Fitness} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {
  ControlledPropagation,
  ControlledPropagationConfig,
  PROPAGATION_FINISHED,
  PROPAGATION_RUNNING,
  PropagationListener,
  PropagationRecording,
  RunState
} from './propagation'
import {PropagationTarget, State} from './types'

export abstract class BaseController<GeneType, FitnessValueType> {
  public store: Store<State<GeneType, FitnessValueType>>

  private listener: PropagationListener
  private recording: PropagationRecording<GeneType, FitnessValueType>
  private propagation: ControlledPropagation<GeneType, FitnessValueType>

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
    this.propagation = this.buildPropagation()

    this.getFitness = this.getFitness.bind(this)
    this.randomizeTarget = this.randomizeTarget.bind(this)
    this.setPlaybackPosition = this.setPlaybackPosition.bind(this)
    this.setRecordAllIterations = this.setRecordAllIterations.bind(this)
    this.state = this.state.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  initialize(): void {
    this.propagation.iterate()
    this.updateView()
  }

  onRunStateChange(runState: RunState): void {
    if (runState !== PROPAGATION_RUNNING) {
      this.listener.stop()
      this.updateView()
    }
  }

  randomizeTarget(): void {
    this.setTarget(this.randomTarget())
    this.propagation = this.buildPropagation()
    this.propagation.iterate()
    this.updateView()
  }

  setPlaybackPosition(playbackPosition: number): void {
    this.recording.setPlaybackPosition(playbackPosition)
    this.updateView()
  }

  setTarget(chromosome: PropagationTarget<GeneType, FitnessValueType>): void {
    this.store.setState({
      target: chromosome
    })

    this.propagation = this.buildPropagation()
    this.recording.reset()
    this.updateView()
  }

  setRecordAllIterations(allIterations: boolean): void {
    this.propagation = this.buildPropagation()
    this.recording.configure({allIterations})
    this.recording.reset()
    this.propagation.iterate()
    this.updateView()
  }

  start(): void {
    if (this.propagation.runState === PROPAGATION_RUNNING) {
      return
    }

    if (this.propagation.runState === PROPAGATION_FINISHED) {
      this.propagation = this.buildPropagation()
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

  target(): PropagationTarget<GeneType, FitnessValueType> {
    return this.store.getState().target
  }

  updateView(): void {
    this.store.setState({
      allIterations: this.recording.isRecordingAllIterations(),
      best: this.recording.best(),
      current: this.recording.current(),
      first: this.recording.first(),
      isRunning: this.propagation?.runState === PROPAGATION_RUNNING,
      iterationCount: this.propagation?.iterationCount ?? 0,
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
  protected abstract randomTarget(): PropagationTarget<
    GeneType,
    FitnessValueType
  >

  private buildPropagation(): ControlledPropagation<
    GeneType,
    FitnessValueType
  > {
    return new ControlledPropagation<GeneType, FitnessValueType>({
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      onImprovement: chromosome => {
        this.recording.addImprovement(chromosome)
      },
      onIteration: chromosome => {
        this.recording.addIteration(chromosome)
      },
      onRunStateChange: this.onRunStateChange.bind(this),
      optimalFitness: this.target()!.fitness,
      ...this.propogationOptions()
    })
  }
}
