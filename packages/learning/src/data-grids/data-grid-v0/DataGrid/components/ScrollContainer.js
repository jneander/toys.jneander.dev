import React, {Component} from 'react'

import Grid from './Grid'

function range(start, end) {
  const list = []
  for (var i = start; i <= end; i++) {
    list.push(i)
  }
  return list
}

export default class ScrollContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      totalRowHeight: this.props.rows.length * this.props.rowHeight,
      totalGridHeight: this.props.rows.length * this.props.rowHeight + this.props.headerHeight,
      bufferRowsAbove: 0,
      bufferRowsBelow: 0
    }

    this.handleGridScroll = this.handleGridScroll.bind(this)
  }

  handleGridScroll(event) {
    const visibleRowsHeight = event.currentTarget.clientHeight - this.props.headerHeight

    const visibleHeight = event.currentTarget.clientHeight
    const hiddenPixelsAbove = event.currentTarget.scrollTop
    const hiddenPixelsBelow = this.state.totalRowHeight - hiddenPixelsAbove - visibleRowsHeight

    const bufferRowsAbove = Math.floor(hiddenPixelsAbove / this.props.rowHeight)
    const bufferRowsBelow = Math.floor(hiddenPixelsBelow / this.props.rowHeight)
    const visibleRowCount = this.props.rows.length - bufferRowsAbove - bufferRowsBelow

    const newStates = []

    if (bufferRowsAbove !== this.state.bufferRowsAbove) {
      newStates.push({bufferRowsAbove: bufferRowsAbove})
    }

    if (bufferRowsBelow !== this.state.bufferRowsBelow) {
      newStates.push({bufferRowsBelow: bufferRowsBelow})
    }

    if (newStates.length) {
      this.setState(Object.assign({}, ...newStates))
    }
  }

  render() {
    const firstRowVisible = this.state.bufferRowsAbove
    const lastRowVisible = this.props.rows.length - this.state.bufferRowsBelow - 1

    return (
      <Grid
        {...this.props}
        bufferRowsAbove={this.state.bufferRowsAbove}
        bufferRowsBelow={this.state.bufferRowsBelow}
        onScroll={this.handleGridScroll}
        visibleRowRange={range(firstRowVisible, lastRowVisible)}
      />
    )
  }
}
