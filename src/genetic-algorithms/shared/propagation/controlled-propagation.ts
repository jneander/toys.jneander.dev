import {
  Propagation,
  PropagationConfig,
  PropagationRecord
} from '@jneander/genetics'
import {BoundedLoop} from '@jneander/utils-async'

import {
  PROPAGATION_FINISHED,
  PROPAGATION_RUNNING,
  PROPAGATION_STOPPED
} from './constants'
import {RunState} from './types'

export type ControlledPropagationConfig<GeneType, FitnessValueType> =
  PropagationConfig<GeneType, FitnessValueType> & {
    onRunStateChange?: (runState: RunState) => void
  }

export class ControlledPropagation<GeneType, FitnessValueType> {
  private config: ControlledPropagationConfig<GeneType, FitnessValueType>
  private loop: BoundedLoop | null
  private propagation: Propagation<GeneType, FitnessValueType>
  private _runState: RunState

  constructor(config: ControlledPropagationConfig<GeneType, FitnessValueType>) {
    this.config = config

    this.loop = null
    this.propagation = new Propagation<GeneType, FitnessValueType>(config)
    this._runState = PROPAGATION_STOPPED
  }

  get runState(): RunState {
    return this._runState
  }

  get best(): PropagationRecord<GeneType, FitnessValueType> | null {
    return this.propagation.best
  }

  get current(): PropagationRecord<GeneType, FitnessValueType> | null {
    return this.propagation.current
  }

  get iterationCount(): number {
    return this.propagation.iteration
  }

  start(): void {
    if (this.runState === PROPAGATION_STOPPED) {
      this.loop =
        this.loop || new BoundedLoop({loopFn: this.iterate.bind(this)})
      this.loop.start()
      this.updateState(PROPAGATION_RUNNING)
    }
  }

  stop(): void {
    if (this.runState === PROPAGATION_RUNNING) {
      this.loop!.stop()
      this.updateState(PROPAGATION_STOPPED)
    }
  }

  iterate(): void {
    if (this.propagation.hasReachedOptimalFitness) {
      return
    }

    this.propagation.iterate()

    if (this.propagation.hasReachedOptimalFitness) {
      this.loop!.stop()
      this.updateState(PROPAGATION_FINISHED)
    }
  }

  private updateState(runState: RunState): void {
    if (this.runState !== runState) {
      this._runState = runState
      this.config.onRunStateChange?.(runState)
    }
  }
}
