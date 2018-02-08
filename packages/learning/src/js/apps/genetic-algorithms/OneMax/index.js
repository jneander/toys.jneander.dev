import React from 'react';
import Container from 'instructure-ui/lib/components/Container';

import ExampleControls from 'js/shared/components/ExampleControls';
import ChromosomeTable from 'js/apps/genetic-algorithms/shared/ChromosomeTable';
import State from '../shared/State';

import Controller from './Controller';

export default class OneMax extends React.PureComponent {
  constructor (props) {
    super(props);

    this.controller = new Controller(new State(this));
    this.state = this.controller.getInitialState();

    this.onPositionChange = this.onPositionChange.bind(this);
  }

  componentWillMount () {
    this.controller.initialize();
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
          recordAllIterations={this.state.allIterations}
        />

        <Container as="div" margin="medium 0 0 0">
          <ChromosomeTable
            best={this.state.best}
            current={this.state.current}
            first={this.state.first}
            formatGenes={genes => genes.join('')}
            target={this.state.target}
          />
        </Container>
      </div>
    );
  }
}
