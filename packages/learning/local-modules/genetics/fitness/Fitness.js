export default class Fitness {
  constructor (value) {
    this.value = value;
  }

  isEqualTo (fitness) {
    return this.value == fitness.value;
  }

  isGreaterThan (fitness) {
    return this.value > fitness;
  }

  isLessThan (fitness) {
    return this.value < fitness.value;
  }

  toString () {
    return this.value.toString()
  }

  valueOf (fitness) {
    return this.value;
  }
}
