export default class Muscle {
  axon: number
  nodeConnection1: number
  nodeConnection2: number
  length: number
  rigidity: number

  constructor(
    axon: number,
    nodeConnection1: number,
    nodeConnection2: number,
    length: number,
    rigidity: number,
  ) {
    this.axon = axon
    this.length = length
    this.nodeConnection1 = nodeConnection1
    this.nodeConnection2 = nodeConnection2
    this.rigidity = rigidity
  }

  clone(): Muscle {
    return new Muscle(
      this.axon,
      this.nodeConnection1,
      this.nodeConnection2,
      this.length,
      this.rigidity,
    )
  }
}
