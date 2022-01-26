import type p5 from 'p5'
import type {Color} from 'p5'

export function getSpeciesColor(
  p5: p5,
  speciesId: number,
  adjust: boolean
): Color {
  p5.colorMode(p5.HSB, 1.0)

  let col = (speciesId * 1.618034) % 1
  if (speciesId == 46) {
    col = 0.083333
  }

  let light = 1.0
  if (Math.abs(col - 0.333) <= 0.18 && adjust) {
    light = 0.7
  }

  return p5.color(col, 1.0, light)
}
