import React from 'react';
import IconPauseSolid from 'instructure-icons/lib/Solid/IconPauseSolid';
import IconPlaySolid from 'instructure-icons/lib/Solid/IconPlaySolid';
import IconRefreshSolid from 'instructure-icons/lib/Solid/IconRefreshSolid';
import Button from 'instructure-ui/lib/components/Button';
import Checkbox from 'instructure-ui/lib/components/Checkbox';
import Container from 'instructure-ui/lib/components/Container';
import RangeInput from 'instructure-ui/lib/components/RangeInput';
import ScreenReaderContent from 'instructure-ui/lib/components/ScreenReaderContent';

export default class ExampleControls extends React.PureComponent {
  static defaultProps = {
    onSetRecordAllIterations () {}
  };

  constructor (props) {
    super(props);

    this.state = {
      currentStep: 1
    };

    this.pause = this.pause.bind(this);
    this.refresh = this.refresh.bind(this);
    this.start = this.start.bind(this);

    this.onRangeChange = (indexString) => {
      this.props.onPositionChange(parseInt(indexString, 10));
    };
  }

  onToggleRecordAllIterations = (event) => {
    this.props.onSetRecordAllIterations(event.target.checked);
  }

  pause () {
    this.props.onPause();
  }

  refresh () {
    this.props.onRefresh();
  }

  start () {
    this.props.onStart();
  }

  render () {
    return (
      <Container as="div">
        <Container as="div">
          <Button key="refresh" margin="0 x-small 0 0" onClick={this.refresh}>
            <IconRefreshSolid title="Refresh" />
            Refresh
          </Button>

          {
            this.props.playing ? (
              <Button key="play-pause" margin="0 x-small 0 0" onClick={this.pause}>
                <IconPauseSolid title="Pause" />
                Pause
              </Button>
            ) : (
              <Button key="play-pause" margin="0 x-small 0 0" onClick={this.start}>
                <IconPlaySolid title="Start" />
                Start
              </Button>
            )
          }

          <Checkbox
            checked={this.props.recordAllIterations}
            disabled={this.props.playing}
            inline
            label="All Iterations"
            onChange={this.onToggleRecordAllIterations}
            size="small"
            variant="toggle" />
        </Container>

        {
          this.props.recordAllIterations &&
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
        }
      </Container>
    );
  }
}
