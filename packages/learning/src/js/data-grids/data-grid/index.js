import React, {Component} from 'react'
import ApplyTheme from '@instructure/ui-core/lib/components/ApplyTheme'
import Container from '@instructure/ui-core/lib/components/Container'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Select from '@instructure/ui-core/lib/components/Select'
import canvas from '@instructure/ui-themes/lib/canvas'

import AppHarness from '../../shared/components/AppHarness'
import TableReport from '../shared/components/TableReport'
import ExampleX from './ExampleX'

const examples = [{label: 'My Example', component: ExampleX}]

export default class DataGridExamples extends Component {
  state = {
    debugData: {},
    selectedExample: examples[0]
  }

  onDebug = debugData => {
    this.setState({debugData})
  }

  onExampleChange = event => {
    this.setState({
      selectedExample: examples.find(example => example.label === event.target.value)
    })
  }

  render() {
    const Example = this.state.selectedExample

    return (
      <AppHarness page="dataGrid">
        <ApplyTheme theme={canvas}>
          <Container as="div" padding="large">
            <main style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{flex: '0 0 200px', margin: '0 20px 0 0'}}>
                <Container as="header" margin="0 0 medium 0">
                  <Heading level="h2">DataGrid</Heading>
                </Container>

                <Container as="div" margin="0 0 medium 0">
                  <Select label="Examples" onChange={this.onExampleChange} value={Example.label}>
                    {examples.map(example => (
                      <option key={example.label} value={example.label}>
                        {example.label}
                      </option>
                    ))}
                  </Select>
                </Container>

                <TableReport data={this.state.debugData} />
              </div>

              <Example.component debug={this.onDebug} />
            </main>
          </Container>
        </ApplyTheme>
    </AppHarness>
    )
  }
}
