import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'

import ChromosomeTable from '../shared/ChromosomeTable'
import ExampleControls from '../shared/ExampleControls'
import State from '../shared/State'
import Cards from './Cards'
import Controller from './Controller'
import Metrics from './Metrics'

export default class CardSplitting extends PureComponent {
  constructor(props) {
    super(props)

    this.controller = new Controller(new State(this))
    this.state = this.controller.getInitialState()

    this.onPositionChange = this.onPositionChange.bind(this)
  }

  componentWillMount() {
    this.controller.initialize()
  }

  onPositionChange(position) {
    this.controller.setPlaybackPosition(position)
  }

  render() {
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

        <Metrics
          iteration={this.state.current ? this.state.current.iteration : 0}
          margin="small 0 0 0"
        />

        <Container as="div" margin="medium 0 0 0">
          {this.state.current && <Cards label="Current" chromosome={this.state.current} />}

          {this.state.best && <Cards label="Best" chromosome={this.state.best} />}
        </Container>
      </div>
    )
  }
}
