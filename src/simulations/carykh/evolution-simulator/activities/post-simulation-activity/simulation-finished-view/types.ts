import type {P5Wrapper} from '../../../p5-utils'

export interface P5ClientViewAdapter {
  initialize(p5Wrapper: P5Wrapper): void
  deinitialize(): void

  draw?: () => void

  onMousePressed?: () => void
  onMouseReleased?: () => void
  onMouseWheel?: (event: WheelEvent) => void
}
