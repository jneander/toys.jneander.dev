import {P5Wrapper} from './p5-wrapper'

export type P5ViewDimensions = {
  height: number
  width: number
}

export interface P5ViewAdapter {
  initialize(p5Wrapper: P5Wrapper): void
  deinitialize(): void

  draw?: () => void

  onMousePressed?: () => void
  onMouseReleased?: () => void
  onMouseWheel?: (event: WheelEvent) => void
}
