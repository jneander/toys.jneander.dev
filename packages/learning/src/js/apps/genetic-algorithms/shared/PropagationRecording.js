export default class PropagationRecording {
  constructor(config = {}) {
    this.reset()

    this.config = {
      allIterations: false,
      ...config
    }

    this.addIteration = this.addIteration.bind(this)
    this.addImprovement = this.addImprovement.bind(this)
    this._recording = false
    this._playbackPosition = 1
  }

  addIteration(chromosome) {
    if (this.config.allIterations && this._playbackPosition === this._iterations.length) {
      this._playbackPosition++
    }
    if (this.config.allIterations || this._iterations.length === 0) {
      this._iterations.push(chromosome)
    } else if (this._iterations.length > 0) {
      this._iterations[1] = chromosome
    }
  }

  addImprovement(chromosome) {
    this._improvements.push(chromosome)
  }

  best() {
    if (this._improvements.length === 0) {
      return null
    }

    if (this.config.allIterations) {
      const improvements = this.improvements()
      let best = improvements[0]
      for (let i = 1; i < improvements.length && improvements[i].iteration <= this._playbackPosition; i++) {
        best = improvements[i]
      }
      return best
    } else {
      return this._improvements[this._improvements.length - 1]
    }
  }

  configure(config) {
    this.config = {...this.config, ...config}
    this.reset()
  }

  current() {
    if (this.config.allIterations) {
      return this._iterations[this.playbackPosition() - 1] || null
    } else {
      return this._iterations[this._iterations.length - 1] || null
    }
  }

  first() {
    return this._iterations[0]
  }

  isRecordingAllIterations() {
    return this.config.allIterations
  }

  isRecording() {
    return this._recording
  }

  improvements() {
    return this._improvements
  }

  iterations() {
    return this._iterations
  }

  playbackPosition() {
    return this._playbackPosition
  }

  reset() {
    this._iterations = []
    this._improvements = []
    this._playbackPosition = 1
  }

  setPlaybackPosition(position) {
    this._playbackPosition = position
  }

  startRecording() {
    this._recording = true
  }

  stopRecording() {
    this._recording = false
    this.reset()
  }
}
