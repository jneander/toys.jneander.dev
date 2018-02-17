import React, {PureComponent} from 'react'
import Container from '@instructure/ui-core/lib/components/Container'
import NumberInput from '@instructure/ui-core/lib/components/NumberInput'

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
      <Container as="div" margin={this.props.margin}>
        <NumberInput
          disabled={this.props.disabled}
          inline
          label="Board Size"
          max="20"
          min="4"
          onChange={this.onBoardSizeChange}
          value={this.state.boardSize}
        />
      </Container>
    )
  }
}
