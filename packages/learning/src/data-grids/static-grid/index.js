import React, {Component} from 'react'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'

import Layout from '../../shared/components/Layout'
import GridWithoutRowHeaders from './GridWithoutRowHeaders'
import GridWithRowHeaders from './GridWithRowHeaders'

export default class StaticGrids extends Component {
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

  render() {
    const Example = this.state.selectedExample

    return (
      <Layout>
        <Container as="div" padding="medium">
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">Static Grids</Heading>
          </Container>

          <Container as="div" margin="0 0 medium 0">
            <Checkbox
              inline
              label="Row Headers"
              onChange={this.onRowHeadersChange}
              size="small"
              variant="toggle"
            />
          </Container>

          {this.state.includeRowHeaders ? (
            <GridWithRowHeaders />
          ) : (
            <GridWithoutRowHeaders />
          )}
        </Container>
      </Layout>
    )
  }
}
