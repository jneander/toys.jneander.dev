import {Chromosome, Fitness} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import ControlledPropagation, {
  ControlledPropagationConfig
} from './ControlledPropagation'
import PropagationListener from './PropagationListener'
import PropagationRecording from './PropagationRecording'
import {State} from './types'

export default abstract class Controller<GeneType, FitnessValueType> {
  public store: Store<State<GeneType, FitnessValueType>>

  private listener: PropagationListener
  private recording: PropagationRecording<GeneType, FitnessValueType>
  private propagation: ControlledPropagation<GeneType, FitnessValueType> | null
  private _target: Chromosome<GeneType, FitnessValueType> | null

  constructor() {
    this.store = new Store<State<GeneType, FitnessValueType>>({
      allIterations: false,
      best: null,
      current: null,
      first: null,
      isRunning: false,
      iterationCount: 0,
      playbackPosition: 1,
      target: null
    })

    this.listener = new PropagationListener(this.updateView.bind(this))
    this.recording = new PropagationRecording()
    this.propagation = null
    this._target = null

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
    this.createPropagation()
  }

  createPropagation(): void {
    this.propagation = new ControlledPropagation({
      generateParent: this.generateParent.bind(this),
      onFinish: this.onFinish.bind(this),
      onImprovement: chromosome => {
        this.recording.addImprovement(chromosome)
      },
      onIteration: chromosome => {
        this.recording.addIteration(chromosome)
      },
      optimalFitness: this.target()!.fitness!,
      ...this.propogationOptions()
    })
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

  setTarget(target: Chromosome<GeneType, FitnessValueType>): void {
    this._target = target
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

  target() {
    return this._target
  }

  updateView() {
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
  protected abstract generateParent(): Chromosome<GeneType, FitnessValueType>
  protected abstract getFitness(
    chromosome: Chromosome<GeneType, FitnessValueType>
  ): Fitness<FitnessValueType>
  protected abstract propogationOptions(): {
    mutate: ControlledPropagationConfig<GeneType, FitnessValueType>['mutate']
  }
  protected abstract randomTarget(): Chromosome<GeneType, FitnessValueType>
}
