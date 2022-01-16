export interface ActivityInterface {
  initialize(): void
  deinitialize(): void
  draw(): void
  onMousePressed(): void
  onMouseReleased(): void
  onMouseWheel(event: WheelEvent): void
}

export abstract class Activity implements ActivityInterface {
  initialize(): void {}
  deinitialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}

export class NullActivity implements ActivityInterface {
  initialize(): void {}
  deinitialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}
