import type {Store} from '@jneander/utils-state'

export type ActivityState = {
  simulationSpeed: number
  timer: number
}

export type ActivityStore = Store<ActivityState>

export interface P5UI {
  initialize(): void
  draw(): void
  onMousePressed(): void
  onMouseReleased(): void
  onMouseWheel(event: WheelEvent): void
}
