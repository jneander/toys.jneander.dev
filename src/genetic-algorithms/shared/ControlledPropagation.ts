import {Propagation, PropagationConfig} from '@jneander/genetics'

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

  best() {
    return this.propagation.best()
  }

  current() {
    return this.propagation.current()
  }

  isFinished() {
    return this.runState === 'finished'
  }

  isRunning() {
    return this.runState === 'running'
  }

  isStopped() {
    return this.runState === 'stopped'
  }

  iterationCount() {
    return this.propagation.iterationCount
  }

  onFinish() {
    this.runState = 'finished'
    if (this.config.onFinish) {
      this.config.onFinish()
    }
  }

  onRun() {
    this.runState = 'running'
    if (this.config.onRun) {
      this.config.onRun()
    }
  }

  resume() {
    if (this.isStopped()) {
      this.propagation.run()
    }
  }

  start() {
    if (this.isStopped()) {
      this.propagation.run()
    }
  }

  stop() {
    if (this.isRunning()) {
      this.propagation.stop()
      this.runState = 'stopped'
    }
  }
}
