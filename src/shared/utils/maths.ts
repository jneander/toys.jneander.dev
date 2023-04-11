export function sum(array: number[]): number {
  return array.reduce((sum, value) => sum + value, 0)
}

export function product(array: number[]): number {
  return array.reduce((sum, value) => sum * value, 1)
}
