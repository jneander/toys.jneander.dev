import React, {PureComponent} from 'react'
import IconPause from '@instructure/ui-icons/lib/Solid/IconPause'
import IconPlay from '@instructure/ui-icons/lib/Solid/IconPlay'
import IconRefresh from '@instructure/ui-icons/lib/Solid/IconRefresh'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Container from '@instructure/ui-container/lib/components/Container'
import RangeInput from '@instructure/ui-forms/lib/components/RangeInput'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

export default class ExampleControls extends PureComponent {
  static defaultProps = {
    onSetRecordAllIterations() {}
  }

  constructor(props) {
    super(props)

    this.state = {
      currentStep: 1
    }

    this.pause = this.pause.bind(this)
    this.refresh = this.refresh.bind(this)
    this.start = this.start.bind(this)

    this.onRangeChange = indexString => {
      this.props.onPositionChange(parseInt(indexString, 10))
    }
  }

  onToggleRecordAllIterations = event => {
    this.props.onSetRecordAllIterations(event.target.checked)
  }

  pause() {
    this.props.onPause()
  }

  refresh() {
    this.props.onRefresh()
  }

  start() {
    this.props.onStart()
  }

  render() {
    return (
      <Container as="div">
        <Container as="div">
          <Button key="refresh" margin="0 x-small 0 0" onClick={this.refresh}>
            <IconRefresh title="Refresh" />
            Refresh
          </Button>

          {this.props.playing ? (
            <Button key="play-pause" margin="0 x-small 0 0" onClick={this.pause}>
              <IconPause title="Pause" />
              Pause
            </Button>
          ) : (
            <Button key="play-pause" margin="0 x-small 0 0" onClick={this.start}>
              <IconPlay title="Start" />
              Start
            </Button>
          )}

          <Checkbox
            checked={this.props.recordAllIterations}
            disabled={this.props.playing}
            inline
            label="All Iterations"
            onChange={this.onToggleRecordAllIterations}
            size="small"
            variant="toggle"
          />
        </Container>

        {this.props.recordAllIterations && (
          <Container as="div" margin="medium 0">
            <RangeInput
              disabled={this.props.playing}
              displayValue={false}
              label={<ScreenReaderContent>Iteration Range</ScreenReaderContent>}
              max={this.props.rangePositionCount}
              min={1}
              onChange={this.onRangeChange}
              value={this.props.rangePosition}
            />
          </Container>
        )}
      </Container>
    )
  }
}
