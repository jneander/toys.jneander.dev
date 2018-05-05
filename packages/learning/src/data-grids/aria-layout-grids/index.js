import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import TabList, {TabPanel} from '@instructure/ui-tabs/lib/components/TabList'
import Text from '@instructure/ui-elements/lib/components/Text'
import View from '@instructure/ui-layout/lib/components/View'

import Layout from '../../shared/components/Layout'
import ScrollableList from './ScrollableList'

export default class AriaLayoutGrids extends PureComponent {
  render() {
    return (
      <Layout>
        <View margin="medium" display="block">
          <View as="header" margin="0 0 medium 0">
            <Heading level="h2">ARIA Layout Grids</Heading>
          </View>

          <ScrollableList perPage={5} />
        </View>
      </Layout>
    )
  }
}
