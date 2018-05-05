import React, {PureComponent} from 'react'
import NumberInput from '@instructure/ui-forms/lib/components/NumberInput'
import View from '@instructure/ui-layout/lib/components/View'

export default class Configuration extends PureComponent {
  constructor(props) {
    super(props)

    this.onBoardSizeChange = this.onBoardSizeChange.bind(this)

    this.state = {
      boardSize: String(props.boardSize)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      boardSize: String(nextProps.boardSize)
    })
  }

  onBoardSizeChange(_event, value) {
    const size = parseInt(value, 10)
    if (size >= 4 && size <= 20) {
      this.props.onBoardSizeChange(size)
    }
  }

  render() {
    return (
      <View as="div" margin={this.props.margin}>
        <NumberInput
          disabled={this.props.disabled}
          inline
          label="Board Size"
          max="20"
          min="4"
          onChange={this.onBoardSizeChange}
          value={this.state.boardSize}
        />
      </View>
    )
  }
}
