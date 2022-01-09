export default class Node {
  // FLOAT
  x: number
  y: number
  vx: number
  vy: number
  prevX: number
  prevY: number
  pvx: number
  pvy: number
  m: number
  f: number
  value: number
  valueToBe: number
  pressure: number

  // INT
  operation: number
  axon1: number
  axon2: number

  safeInput: boolean

  constructor(
    tx: number,
    ty: number,
    tvx: number,
    tvy: number,
    tm: number,
    tf: number,
    val: number,
    op: number,
    a1: number,
    a2: number
  ) {
    this.prevX = this.x = tx
    this.prevY = this.y = ty
    this.pvx = this.vx = tvx
    this.pvy = this.vy = tvy

    this.m = tm
    this.f = tf

    this.value = this.valueToBe = val
    this.operation = op
    this.axon1 = a1
    this.axon2 = a2
    this.pressure = 0

    this.safeInput = false
  }

  realizeMathValues(): void {
    this.value = this.valueToBe
  }

  clone(): Node {
    return new Node(
      this.x,
      this.y,
      0,
      0,
      this.m,
      this.f,
      this.value,
      this.operation,
      this.axon1,
      this.axon2
    )
  }
}
