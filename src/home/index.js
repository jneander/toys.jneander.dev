import React, {Component} from 'react'
import View from '@instructure/ui-layout/lib/components/View'

import Layout from '../shared/components/Layout'

export default class Home extends Component {
  render() {
    return (
      <Layout page="home">
        <View as="div" padding="medium" />
      </Layout>
    )
  }
}
