export default class Fitness {
  constructor(value, maximize = true) {
    this.value = value
    this.maximize = maximize
  }

  isEqualTo(fitness) {
    return this.value == fitness.value
  }

  isGreaterThan(fitness) {
    return this.maximize ? this.value > fitness : this.value < fitness
  }

  isLessThan(fitness) {
    return this.maximize ? this.value < fitness : this.value > fitness
  }

  toString() {
    return this.value.toString()
  }

  valueOf(fitness) {
    return this.value
  }
}
