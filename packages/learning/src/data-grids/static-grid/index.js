import React, {Component} from 'react'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import View from '@instructure/ui-layout/lib/components/View'

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
        <View as="div" padding="medium">
          <View as="header" margin="0 0 medium 0">
            <Heading level="h2">Static Grids</Heading>
          </View>

          <View as="div" margin="0 0 medium 0">
            <Checkbox
              inline
              label="Row Headers"
              onChange={this.onRowHeadersChange}
              size="small"
              variant="toggle"
            />
          </View>

          {this.state.includeRowHeaders ? <GridWithRowHeaders /> : <GridWithoutRowHeaders />}
        </View>
      </Layout>
    )
  }
}
