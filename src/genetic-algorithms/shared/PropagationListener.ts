export default class PropagationListener {
  private interval: ReturnType<typeof setInterval> | null
  private onUpdate: () => void

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate

    this.interval = null
  }

  start() {
    this.interval = setInterval(() => {
      this.onUpdate()
    }, 16)
  }

  stop() {
    if (this.interval != null) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}
