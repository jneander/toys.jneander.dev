import type {ActivityState} from './types'

export class ActivityController {
  private state: ActivityState

  constructor() {
    this.state = {
      timer: 0
    }
  }

  getTimer(): number {
    return this.state.timer
  }

  setTimer(timer: number): void {
    this.state.timer = timer
  }
}
