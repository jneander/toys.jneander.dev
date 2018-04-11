import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'

import Layout from '../../shared/components/Layout'
import MinimalDataGrid from './MinimalDataGrid'
import SortableDataGrid from './SortableDataGrid'
import styles from './styles.css'

export default class WaiDataTables extends PureComponent {
  state = {
    selectedTabIndex: 0
  }

  onExampleChange = tabIndex => {
    this.setState({selectedTabIndex: tabIndex})
  }

  render() {
    return (
      <Layout>
        <Container margin="medium" display="block">
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">WAI Data Tables</Heading>
          </Container>

          <Container as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 1: Minimal Data Grid</Heading>

            <div className={styles.ExampleContainer}>
              <MinimalDataGrid />
            </div>
          </Container>

          <Container as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 2: Sortable Data Grid With Editable Cells</Heading>

            <div className={styles.ExampleContainer}>
              <SortableDataGrid />
            </div>
          </Container>

          <Text>
            <p>
              These are the{' '}
              <Link href="https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/dataGrids.html">
                Data Grid Examples
              </Link>, from the{' '}
              <Link href="https://www.w3.org/TR/wai-aria-practices-1.1/">
                WAI-ARIA Authoring Practices 1.1
              </Link>. They have been recreated in React as an exercise in understanding how a data
              grid can be accessible.
            </p>
          </Text>
        </Container>
      </Layout>
    )
  }
}
