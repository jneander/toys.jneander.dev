import type p5 from 'p5'
import type {Font} from 'p5'

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

  constructor(config: AppViewConfig) {
    this.height = config.height
    this.scale = config.scale
    this.width = config.width

    this.font = config.font
    this.canvas = config.p5
    const {canvas} = this

    canvas.createCanvas(this.width * this.scale, this.height * this.scale)

    canvas.ellipseMode(canvas.CENTER)
    canvas.textFont(config.font, 96)
    canvas.textAlign(canvas.CENTER)
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
