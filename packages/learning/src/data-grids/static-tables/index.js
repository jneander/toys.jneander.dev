import React, {Component} from 'react'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'

import Layout from '../../shared/components/Layout'
import TableReport from '../shared/components/TableReport'
import TableWithoutRowHeaders from './TableWithoutRowHeaders'
import TableWithRowHeaders from './TableWithRowHeaders'

export default class StaticTables extends Component {
  static defaultProps = {
    debuggable: false
  }

  constructor(props) {
    super(props)

    this.state = {
      includeRowHeaders: false
    }

    this.onRowHeadersChange = event => {
      this.setState({
        includeRowHeaders: event.target.checked
      })
    }
  }

  bindDebugger = ref => {
    this.debug = ref
  }

  onDebug = debugData => {
    this.debug.update(debugData)
  }

  onDebugChange = event => {
    this.setState({
      debug: event.target.checked
    })
  }

  render() {
    const Example = this.state.selectedExample

    return (
      <Layout>
        <Container as="div" padding="medium">
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">Static Tables</Heading>
          </Container>

          <Container as="div" margin="0 0 medium 0">
            <Checkbox
              inline
              label="Row Headers"
              onChange={this.onRowHeadersChange}
              size="small"
              variant="toggle"
            />

            {this.props.debuggable && (
              <Container margin="0 0 0 small">
                <Checkbox inline label="Debug" onChange={this.onDebugChange} />
              </Container>
            )}
          </Container>

          <div style={{display: 'flex', flexDirection: 'row'}}>
            {this.props.debuggable &&
              this.state.debug && (
                <div style={{flex: '0 0 200px', margin: '0 20px 0 0'}}>
                  <TableReport data={this.state.debugData} />
                </div>
              )}

            {this.state.includeRowHeaders ? (
              <TableWithRowHeaders debug={this.onDebug} />
            ) : (
              <TableWithoutRowHeaders debug={this.onDebug} />
            )}
          </div>
        </Container>
      </Layout>
    )
  }
}
