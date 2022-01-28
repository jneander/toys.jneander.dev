import type p5 from 'p5'
import type {Color} from 'p5'

type HSL = [number, number, number]
type HSB = [number, number, number]

function hsbToHsl(hue: number, saturation: number, brightness: number): HSL {
  const lightness = ((2 - saturation) * brightness) / 2

  if (lightness != 0) {
    if (lightness == 1) {
      saturation = 0
    } else if (lightness < 0.5) {
      saturation = (saturation * brightness) / (lightness * 2)
    } else {
      saturation = (saturation * brightness) / (2 - lightness * 2)
    }
  }

  return [hue, saturation, lightness]
}

export function getSpeciesColorHSL(speciesId: number, adjust: boolean): HSL {
  return hsbToHsl(...getSpeciesColorHSB(speciesId, adjust))
}

export function getSpeciesColor(
  p5: p5,
  speciesId: number,
  adjust: boolean
): Color {
  const [h, s, b] = getSpeciesColorHSB(speciesId, adjust)

  p5.colorMode(p5.HSB, 1.0)
  return p5.color(h, s, b)
}

function getSpeciesColorHSB(speciesId: number, adjust: boolean): HSB {
  let hue = (speciesId * 1.618034) % 1
  if (speciesId == 46) {
    hue = 0.083333
  }

  let brightness = 1.0
  if (Math.abs(hue - 0.333) <= 0.18 && adjust) {
    brightness = 0.7
  }

  return [hue, 1.0, brightness]
}
