import {
  Propagation,
  PropagationConfig,
  PropagationRecord
} from '@jneander/genetics'

export type ControlledPropagationConfig<GeneType, FitnessValueType> = Omit<
  PropagationConfig<GeneType, FitnessValueType>,
  'onFinish' | 'onRun'
> & {
  onFinish?: () => void
  onRun?: () => void
}

export default class ControlledPropagation<GeneType, FitnessValueType> {
  private config: ControlledPropagationConfig<GeneType, FitnessValueType>
  private propagation: Propagation<GeneType, FitnessValueType>
  private runState: 'stopped' | 'running' | 'finished'

  constructor(config: ControlledPropagationConfig<GeneType, FitnessValueType>) {
    this.config = config

    this.propagation = new Propagation<GeneType, FitnessValueType>({
      ...config,
      onFinish: this.onFinish.bind(this),
      onRun: this.onRun.bind(this)
    })
    this.runState = 'stopped'
  }

  best(): PropagationRecord<GeneType, FitnessValueType> | null {
    return this.propagation.best
  }

  current(): PropagationRecord<GeneType, FitnessValueType> | null {
    return this.propagation.current
  }

  isFinished(): boolean {
    return this.runState === 'finished'
  }

  isRunning(): boolean {
    return this.runState === 'running'
  }

  isStopped(): boolean {
    return this.runState === 'stopped'
  }

  iterationCount(): number {
    return this.propagation.iteration
  }

  onFinish(): void {
    this.runState = 'finished'
    if (this.config.onFinish) {
      this.config.onFinish()
    }
  }

  onRun(): void {
    this.runState = 'running'
    if (this.config.onRun) {
      this.config.onRun()
    }
  }

  resume(): void {
    if (this.isStopped()) {
      this.propagation.run()
    }
  }

  start(): void {
    if (this.isStopped()) {
      this.propagation.run()
    }
  }

  stop(): void {
    if (this.isRunning()) {
      this.propagation.stop()
      this.runState = 'stopped'
    }
  }
}
