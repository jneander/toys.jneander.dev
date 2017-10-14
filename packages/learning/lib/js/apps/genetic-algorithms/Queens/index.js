import React from 'react';
import Container from 'instructure-ui/lib/components/Container';

import ExampleControls from 'js/shared/components/ExampleControls';
import ChromosomeTable from 'js/apps/genetic-algorithms/shared/ChromosomeTable';

import State from '../shared/State';
import Board from './Board';
import Configuration from './Configuration';
import Controller from './Controller';
import Metrics from './Metrics';

export default class OneMax extends React.PureComponent {
  constructor (props) {
    super(props);

    this.controller = new Controller(new State(this));
    this.state = this.controller.getInitialState();

    this.onBoardSizeChange = this.onBoardSizeChange.bind(this);
    this.onPositionChange = this.onPositionChange.bind(this);
  }

  componentWillMount () {
    this.controller.initialize();
  }

  onBoardSizeChange (size) {
    console.log('set board size: ' + size);
    this.controller.setBoardSize(size);
  }

  onPositionChange (position) {
    this.controller.setPlaybackPosition(position);
  }

  render () {
    return (
      <div>
        <ExampleControls
          onPause={this.controller.stop}
          onPositionChange={this.onPositionChange}
          onRefresh={this.controller.randomizeTarget}
          onStart={this.controller.start}
          onSetRecordAllIterations={this.controller.setRecordAllIterations}
          playing={this.state.isRunning}
          rangePosition={this.state.playbackPosition}
          rangePositionCount={this.state.iterationCount}
          recordAllIterations={this.state.allIterations} />

        <Configuration
          boardSize={this.state.boardSize}
          disabled={this.state.isRunning}
          margin="medium 0 0 0"
          onBoardSizeChange={this.onBoardSizeChange}
        />

        <Metrics iteration={this.state.current ? this.state.current.iteration : 0} margin="small 0 0 0" />

        <Container as="div" margin="medium 0 0 0">
          <Board chromosome={this.state.current} size={this.state.boardSize} />
        </Container>
      </div>
    );
  }
}
