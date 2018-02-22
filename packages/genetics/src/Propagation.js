import {BoundedLoop} from '@jneander/async-utils'

function iterate() {
  this.iterationCount++
  const child = this.config.mutate(this.bestParent, this.iterationCount)
  this.config.onIteration(child)

  this.currentGuess = child
  if (this.bestParent.fitness.isGreaterThan(child.fitness)) {
    // this child is worse than the previous iteration; skip it
    return
  }

  if (!child.fitness.isGreaterThan(this.bestParent.fitness)) {
    // this child is not "better" than the parent
    // use it anyway, in case it helps progress
    this.bestParent = child
    return
  }

  this.bestParent = child
  this.config.onImprovement(this.bestParent)

  if (!child.fitness.isLessThan(this.config.optimalFitness)) {
    this.stop()
    this.config.onFinish()
  }
}

export default class Propagation {
  constructor(config) {
    this.config = config

    this.iterationCount = 0
    this.loop = null
  }

  best() {
    return this.bestParent
  }

  current() {
    return this.currentGuess
  }

  run() {
    if (this.loop != null) {
      return
    }

    this.config.onRun()

    if (!this.iterationCount) {
      this.iterationCount++
      this.bestParent = this.config.generateParent()
      this.config.onIteration(this.bestParent)

      this.config.onImprovement(this.bestParent)
      this.currentGuess = this.bestParent

      if (!this.bestParent.fitness.isLessThan(this.config.optimalFitness)) {
        this.config.onFinish()
        return
      }
    }

    this.loop = new BoundedLoop({loopFn: iterate.bind(this)})
    this.loop.start()
  }

  stop() {
    if (this.loop != null) {
      this.loop.stop()
      this.loop = null
    }
  }
}
