import {Propagation, type PropagationConfig, type PropagationRecord} from '@jneander/genetics'
import {ControlledLoopSync, TimerSync} from '@jneander/utils-async'

import {PROPAGATION_FINISHED, PROPAGATION_RUNNING, PROPAGATION_STOPPED} from './constants'
import type {RunState} from './types'

export type ControlledPropagationConfig<GeneType, FitnessValueType> = PropagationConfig<
  GeneType,
  FitnessValueType
> & {
  onRunStateChange?: (runState: RunState) => void
  speed: number
}

export class ControlledPropagation<GeneType, FitnessValueType> {
  private config: ControlledPropagationConfig<GeneType, FitnessValueType>
  private iterator: ControlledLoopSync | TimerSync | null
  private propagation: Propagation<GeneType, FitnessValueType>
  private _runState: RunState

  constructor(config: ControlledPropagationConfig<GeneType, FitnessValueType>) {
    this.config = {...config}

    this.iterator = null
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

  setSpeed(speed: number): void {
    if (this.config.speed === speed) {
      return
    }

    this.config.speed = speed

    if (this.iterator == null) {
      return
    }

    this.ensureIterator()

    if (this.runState === PROPAGATION_RUNNING) {
      this.iterator.start()
    }
  }

  start(): void {
    if (this.runState === PROPAGATION_STOPPED) {
      this.ensureIterator()
      /*
       * Update running state before iterating, as the iterator can potentially
       * complete within one loop. That would result in a mismatch between
       * running state and reality.
       */
      this.updateState(PROPAGATION_RUNNING)
      this.iterator?.start()
    }
  }

  stop(): void {
    if (this.runState === PROPAGATION_RUNNING) {
      this.iterator?.stop()
      this.updateState(PROPAGATION_STOPPED)
    }
  }

  iterate(): void {
    if (this.propagation.hasReachedOptimalFitness) {
      return
    }

    this.propagation.iterate()

    if (this.propagation.hasReachedOptimalFitness) {
      this.iterator?.stop()
      this.updateState(PROPAGATION_FINISHED)
    }
  }

  private ensureIterator(): void {
    if (this.config.speed === 0) {
      if (this.iterator instanceof ControlledLoopSync) {
        return
      }

      this.iterator?.stop()

      this.iterator = new ControlledLoopSync({
        loopFn: this.iterate.bind(this),
      })

      return
    }

    const targetTickIntervalMs = Math.round(1000 / this.config.speed)

    if (this.iterator instanceof TimerSync) {
      this.iterator.setTargetTickIntervalMs(targetTickIntervalMs)
    } else {
      this.iterator?.stop()

      this.iterator = new TimerSync({
        onTick: this.iterate.bind(this),
        targetTickIntervalMs,
      })
    }
  }

  private updateState(runState: RunState): void {
    if (this.runState !== runState) {
      this._runState = runState
      this.config.onRunStateChange?.(runState)
    }
  }
}
