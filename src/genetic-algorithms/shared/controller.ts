import type {Chromosome, Fitness} from '@jneander/genetics'
import type {Store} from '@jneander/utils-state'

import {
  ControlledPropagation,
  ControlledPropagationConfig,
  PROPAGATION_FINISHED,
  PROPAGATION_RUNNING,
  PROPAGATION_STOPPED,
  PropagationListener,
  PropagationRecording,
  RunState,
} from './propagation'
import {State} from './types'

export abstract class BaseController<GeneType, FitnessValueType> {
  public store: Store<State<GeneType, FitnessValueType>>

  private listener: PropagationListener
  private recording: PropagationRecording<GeneType, FitnessValueType>
  private propagation: ControlledPropagation<GeneType, FitnessValueType>

  constructor(store: Store<State<GeneType, FitnessValueType>>) {
    this.store = store

    this.listener = new PropagationListener(this.updateView.bind(this))
    this.recording = new PropagationRecording()
    this.propagation = this.buildPropagation()

    this.getFitness = this.getFitness.bind(this)
    this.iterate = this.iterate.bind(this)
    this.setMaxPropagationSpeed = this.setMaxPropagationSpeed.bind(this)
    this.setPropagationSpeed = this.setPropagationSpeed.bind(this)
    this.setPlaybackPosition = this.setPlaybackPosition.bind(this)
    this.setRecordAllIterations = this.setRecordAllIterations.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  initialize(): void {
    this.propagation.iterate()
    this.updateView()
  }

  iterate(): void {
    if (this.propagation.runState === PROPAGATION_STOPPED) {
      this.propagation.iterate()
      this.updateView()
    }
  }

  setPlaybackPosition(playbackPosition: number): void {
    this.recording.setPlaybackPosition(playbackPosition)
    this.updateView()
  }

  setPropagationSpeed(propagationSpeed: number): void {
    this.store.setState({propagationSpeed})
    this.propagation.setSpeed(this.propagationSpeed)
  }

  setMaxPropagationSpeed(maxPropagationSpeed: boolean): void {
    this.store.setState({maxPropagationSpeed})
    this.propagation.setSpeed(this.propagationSpeed)
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

  protected reset() {
    this.recording.reset()
    this.propagation = this.buildPropagation()
    this.propagation.iterate()
    this.updateView()
  }

  protected abstract generateParent(): Chromosome<GeneType>
  protected abstract getFitness(chromosome: Chromosome<GeneType>): Fitness<FitnessValueType>
  protected abstract propogationOptions(): {
    mutate: ControlledPropagationConfig<GeneType, FitnessValueType>['mutate']
    optimalFitness?: Fitness<FitnessValueType>
  }

  private buildPropagation(): ControlledPropagation<GeneType, FitnessValueType> {
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
      speed: this.propagationSpeed,
      ...this.propogationOptions(),
    })
  }

  private onRunStateChange(runState: RunState): void {
    if (runState !== PROPAGATION_RUNNING) {
      this.listener.stop()
      this.updateView()
    }
  }

  private updateView(): void {
    this.store.setState({
      allIterations: this.recording.isRecordingAllIterations(),
      best: this.recording.best(),
      current: this.recording.current(),
      first: this.recording.first(),
      isRunning: this.propagation?.runState === PROPAGATION_RUNNING,
      iterationCount: this.propagation?.iterationCount ?? 0,
      playbackPosition: this.recording.playbackPosition(),
    })
  }

  private get propagationSpeed(): number {
    const {maxPropagationSpeed, propagationSpeed} = this.store.getState()
    return maxPropagationSpeed ? 0 : propagationSpeed
  }
}
