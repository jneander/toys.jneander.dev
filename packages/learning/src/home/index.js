import React, {Component} from 'react'
import Container from '@instructure/ui-core/lib/components/Container'
import Heading from '@instructure/ui-core/lib/components/Heading'

import Layout from '../shared/components/Layout'

export default class Home extends Component {
  render() {
    return (
      <Layout page="home">
        <Container as="div" padding="medium" />
      </Layout>
    )
  }
}
