import type p5 from 'p5'
import type {Font} from 'p5'

export interface P5WrapperConfig {
  font: Font
  p5: p5
}

export class P5Wrapper {
  public height: number
  public scale: number
  public width: number

  public p5: p5
  public font: Font

  constructor(config: P5WrapperConfig) {
    const {font, p5} = config

    this.height = 100
    this.scale = 1
    this.width = 100

    this.font = font
    this.p5 = p5

    p5.createCanvas(this.width, this.height)

    p5.ellipseMode(p5.CENTER)
    p5.textFont(config.font, 96)
    p5.textAlign(p5.CENTER)
  }

  updateCanvasSize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.p5.resizeCanvas(width, height)
  }

  getCursorPosition(): {cursorX: number; cursorY: number} {
    const cursorX = this.p5.mouseX / this.scale
    const cursorY = this.p5.mouseY / this.scale

    return {cursorX, cursorY}
  }

  rectIsUnderCursor(x: number, y: number, width: number, height: number): boolean {
    const {cursorX, cursorY} = this.getCursorPosition()

    return cursorX >= x && cursorX <= x + width && cursorY >= y && cursorY <= y + height
  }
}
