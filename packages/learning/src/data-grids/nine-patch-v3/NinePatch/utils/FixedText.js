import React, {PureComponent} from 'react'

export default class FixedText extends PureComponent {
  constructor(props) {
    super(props)

    this.updateParentScrollPosition = this.updateParentScrollPosition.bind(this)

    this.state = {
      left: 0,
      top: 0
    }
  }

  updateParentScrollPosition(scrollPosition) {
    this.setState(scrollPosition)
  }

  render() {
    const style = {
      position: 'absolute'
    }

    return (
      <div style={style}>
        <span style={{display: 'block'}}>Left: {this.state.left}</span>
        <span style={{display: 'block'}}>Top: {this.state.top}</span>
      </div>
    )
  }
}
