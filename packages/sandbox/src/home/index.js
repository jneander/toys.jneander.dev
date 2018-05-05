import React from 'react'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import View from '@instructure/ui-layout/lib/components/View'

import Layout from '../shared/components/Layout'

export default function Home() {
  return (
    <Layout>
      <View as="div" padding="small">
        <Heading level="h2">Works in Progress</Heading>
      </View>
    </Layout>
  )
}
