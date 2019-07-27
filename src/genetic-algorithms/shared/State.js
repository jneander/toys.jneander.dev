export default class State {
  constructor(view) {
    this._view = view
  }

  setState(data) {
    this._view.setState(data)
  }

  getState() {
    return this._view.state
  }
}
