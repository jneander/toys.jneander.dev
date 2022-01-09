export default class Muscle {
  axon: number
  c1: number
  c2: number
  len: number
  rigidity: number
  previousTarget: number

  constructor(
    taxon: number,
    tc1: number,
    tc2: number,
    tlen: number,
    trigidity: number
  ) {
    this.axon = taxon
    this.previousTarget = this.len = tlen
    this.c1 = tc1
    this.c2 = tc2
    this.rigidity = trigidity
  }

  clone(): Muscle {
    return new Muscle(this.axon, this.c1, this.c2, this.len, this.rigidity)
  }
}
