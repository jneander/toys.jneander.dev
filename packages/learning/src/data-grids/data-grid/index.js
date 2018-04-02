import React, {Component} from 'react'
import ApplyTheme from '@instructure/ui-themeable/lib/components/ApplyTheme'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Select from '@instructure/ui-forms/lib/components/Select'
import canvas from '@instructure/ui-themes/lib/canvas'

import Layout from '../../shared/components/Layout'
import TableReport from '../shared/components/TableReport'
import ExampleX from './ExampleX'

const examples = [{label: 'My Example', component: ExampleX}]

export default class DataGridExamples extends Component {
  state = {
    debug: false,
    debugData: {},
    selectedExample: examples[0]
  }

  onDebug = debugData => {
    this.setState({debugData})
  }

  onDebugChange = event => {
    this.setState({
      debug: event.target.checked
    })
  }

  onExampleChange = event => {
    this.setState({
      selectedExample: examples.find(example => example.label === event.target.value)
    })
  }

  render() {
    const Example = this.state.selectedExample

    return (
      <Layout page="dataGrid">
        <ApplyTheme theme={canvas}>
          <Container as="div" margin="medium">
            <Container as="header" margin="0 0 medium 0">
              <Heading level="h2">DataGrid</Heading>
            </Container>

            <Container as="div" margin="0 0 medium 0">
              <Select
                inline
                label="Examples"
                layout="inline"
                onChange={this.onExampleChange}
                value={Example.label}
                width="200px"
              >
                {examples.map(example => (
                  <option key={example.label} value={example.label}>
                    {example.label}
                  </option>
                ))}
              </Select>

              <Container margin="0 0 0 small">
                <Checkbox inline label="Debug" onChange={this.onDebugChange} />
              </Container>
            </Container>

            <div style={{display: 'flex', flexDirection: 'row'}}>
              {this.state.debug && (
                <div style={{flex: '0 0 200px', margin: '0 20px 0 0'}}>
                  <TableReport data={this.state.debugData} />
                </div>
              )}

              <Example.component debug={this.onDebug} />
            </div>
          </Container>
        </ApplyTheme>
      </Layout>
    )
  }
}
