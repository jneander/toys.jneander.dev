export default class PropagationListener {
  constructor(onUpdate) {
    this.onUpdate = onUpdate
  }

  start() {
    this.interval = setInterval(() => {
      this.onUpdate()
    }, 16)
  }

  stop() {
    clearInterval(this.interval)
    this.interval = null
  }
}
