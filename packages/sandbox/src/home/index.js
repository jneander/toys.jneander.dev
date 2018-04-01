import React from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'

import Layout from '../shared/components/Layout'

export default function Home() {
  return (
    <Layout>
      <Container as="div" padding="small">
        <Heading level="h2">Works in Progress</Heading>
      </Container>
    </Layout>
  )
}
