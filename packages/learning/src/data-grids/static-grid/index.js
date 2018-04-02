import React, {Component} from 'react'
import ApplyTheme from '@instructure/ui-themeable/lib/components/ApplyTheme'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Select from '@instructure/ui-forms/lib/components/Select'
import canvas from '@instructure/ui-themes/lib/canvas'

import Layout from '../../shared/components/Layout'
import TableReport from '../shared/components/TableReport'
import TableWithoutRowHeaders from './TableWithoutRowHeaders'
import TableWithRowHeaders from './TableWithRowHeaders'

const examples = [
  {label: 'Table without Row Headers', component: TableWithoutRowHeaders},
  {label: 'Table with Row Headers', component: TableWithRowHeaders}
]

export default class StaticGridExamples extends Component {
  constructor(props) {
    super(props)

    this.state = {
      debug: false,
      debugData: {},
      selectedExample: examples[0]
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

  onExampleChange = (_, selectedExample) => {
    this.setState({
      selectedExample: examples.find(example => example.label === selectedExample.label)
    })
  }

  render() {
    const Example = this.state.selectedExample

    return (
      <Layout page="staticGrid">
        <ApplyTheme theme={canvas}>
          <Container as="div" padding="medium">
            <Container as="header" margin="0 0 medium 0">
              <Heading level="h2">Static Grid</Heading>
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
