export function dist2d(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

export function toInt(value: number): number {
  return value | 0
}
