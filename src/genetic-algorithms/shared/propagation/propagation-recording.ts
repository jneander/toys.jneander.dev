import {PropagationRecord} from '@jneander/genetics'

export type PropagationRecordingConfig = {
  allIterations?: boolean
}

export class PropagationRecording<GeneType, FitnessValueType> {
  private config: PropagationRecordingConfig

  private _recording: boolean
  private _playbackPosition: number
  private _iterations: PropagationRecord<GeneType, FitnessValueType>[]
  private _improvements: PropagationRecord<GeneType, FitnessValueType>[]

  constructor(config = {}) {
    this.reset()

    this.config = {
      allIterations: false,
      ...config,
    }

    this._recording = false
    this._playbackPosition = 1
    this._iterations = []
    this._improvements = []

    this.addIteration = this.addIteration.bind(this)
    this.addImprovement = this.addImprovement.bind(this)
  }

  addIteration(record: PropagationRecord<GeneType, FitnessValueType>): void {
    if (this.config.allIterations && this._playbackPosition === this._iterations.length) {
      this._playbackPosition++
    }
    if (this.config.allIterations || this._iterations.length === 0) {
      this._iterations.push(record)
    } else if (this._iterations.length > 0) {
      this._iterations[1] = record
    }
  }

  addImprovement(record: PropagationRecord<GeneType, FitnessValueType>): void {
    this._improvements.push(record)
  }

  best(): PropagationRecord<GeneType, FitnessValueType> | null {
    if (this._improvements.length === 0) {
      return null
    }

    if (this.config.allIterations) {
      const improvements = this.improvements()
      let best = improvements[0]

      for (
        let i = 1;
        i < improvements.length && improvements[i].iteration <= this._playbackPosition;
        i++
      ) {
        best = improvements[i]
      }

      return best
    } else {
      return this._improvements[this._improvements.length - 1]
    }
  }

  configure(config: PropagationRecordingConfig): void {
    this.config = {...this.config, ...config}
    this.reset()
  }

  current(): PropagationRecord<GeneType, FitnessValueType> | null {
    if (this.config.allIterations) {
      return this._iterations[this.playbackPosition() - 1] || null
    } else {
      return this._iterations[this._iterations.length - 1] || null
    }
  }

  first(): PropagationRecord<GeneType, FitnessValueType> | null {
    return this._iterations[0]
  }

  isRecordingAllIterations(): boolean {
    return !!this.config.allIterations
  }

  isRecording(): boolean {
    return this._recording
  }

  improvements(): PropagationRecord<GeneType, FitnessValueType>[] {
    return this._improvements
  }

  iterations(): PropagationRecord<GeneType, FitnessValueType>[] {
    return this._iterations
  }

  playbackPosition(): number {
    return this._playbackPosition
  }

  reset(): void {
    this._iterations = []
    this._improvements = []
    this._playbackPosition = 1
  }

  setPlaybackPosition(position: number): void {
    this._playbackPosition = position
  }

  startRecording(): void {
    this._recording = true
  }

  stopRecording(): void {
    this._recording = false
    this.reset()
  }
}
