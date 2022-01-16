import type p5 from 'p5'
import type {Color, Font, Graphics} from 'p5'

export interface AppViewConfig {
  font: Font
  height: number
  p5: p5
  scale: number
  width: number
}

export class AppView {
  height: number
  scale: number
  width: number

  canvas: p5
  font: Font
  screenGraphics: Graphics

  constructor(config: AppViewConfig) {
    this.height = config.height
    this.scale = config.scale
    this.width = config.width

    this.font = config.font
    this.canvas = config.p5
    const {canvas} = this

    // Create a 1024x576 Canvas
    canvas.createCanvas(this.width * this.scale, this.height * this.scale)

    this.screenGraphics = canvas.createGraphics(1920, 1080)

    canvas.ellipseMode(canvas.CENTER)
    canvas.textFont(config.font, 96)
    canvas.textAlign(canvas.CENTER)

    canvas.textFont(config.font, 96)
    canvas.textAlign(canvas.CENTER)
  }

  getColor(i: number, adjust: boolean): Color {
    const {canvas} = this

    canvas.colorMode(canvas.HSB, 1.0)

    let col = (i * 1.618034) % 1
    if (i == 46) {
      col = 0.083333
    }

    let light = 1.0
    if (Math.abs(col - 0.333) <= 0.18 && adjust) {
      light = 0.7
    }

    return canvas.color(col, 1.0, light)
  }

  getCursorPosition(): {cursorX: number; cursorY: number} {
    const cursorX = this.canvas.mouseX / this.scale
    const cursorY = this.canvas.mouseY / this.scale

    return {cursorX, cursorY}
  }

  rectIsUnderCursor(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const {cursorX, cursorY} = this.getCursorPosition()

    return (
      cursorX >= x &&
      cursorX <= x + width &&
      cursorY >= y &&
      cursorY <= y + height
    )
  }
}
