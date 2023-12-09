import {MAX_MUSCLE_LENGTH_INCLUSIVE, MIN_MUSCLE_LENGTH_INCLUSIVE} from '../constants'
import type {NodeOperationId} from './node-operations'

export class Node {
  // FLOAT
  positionX: number
  positionY: number
  velocityX: number
  velocityY: number
  mass: number
  friction: number
  value: number
  pressure: number

  // INT
  axon1: number
  axon2: number

  // ENUM
  operation: NodeOperationId

  safeInput: boolean

  constructor(
    positionX: number,
    positionY: number,
    velocityX: number,
    velocityY: number,
    mass: number,
    friction: number,
    value: number,
    operationId: NodeOperationId,
    axon1: number,
    axon2: number,
  ) {
    this.positionX = positionX
    this.positionY = positionY
    this.velocityX = velocityX
    this.velocityY = velocityY

    this.mass = mass
    this.friction = friction

    this.value = value
    this.operation = operationId
    this.axon1 = axon1
    this.axon2 = axon2
    this.pressure = 0

    this.safeInput = false
  }

  getClampedValue(): number {
    // Return this node's value clamped to the range usable by muscles.
    return Math.min(Math.max(this.value, MIN_MUSCLE_LENGTH_INCLUSIVE), MAX_MUSCLE_LENGTH_INCLUSIVE)
  }

  clone(): Node {
    return new Node(
      this.positionX,
      this.positionY,
      0,
      0,
      this.mass,
      this.friction,
      this.value,
      this.operation,
      this.axon1,
      this.axon2,
    )
  }
}
