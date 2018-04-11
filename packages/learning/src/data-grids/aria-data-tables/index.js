import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import TabList, {TabPanel} from '@instructure/ui-tabs/lib/components/TabList'
import Text from '@instructure/ui-elements/lib/components/Text'

import Layout from '../../shared/components/Layout'
import MinimalDataGrid from './MinimalDataGrid'
import SortableDataGrid from './SortableDataGrid'

const examples = [
  {label: 'Minimal Data Grid', component: MinimalDataGrid},
  {label: 'Sortable Data Grid With Editable Cells', component: SortableDataGrid}
  // { label: 'Scrollable Data Grid With Column Hiding', component: Example3 }
]

export default class WaiDataTables extends PureComponent {
  state = {
    selectedTabIndex: 0
  }

  onExampleChange = tabIndex => {
    this.setState({selectedTabIndex: tabIndex})
  }

  render() {
    const Example = examples[this.state.selectedExample]

    return (
      <Layout>
        <Container margin="medium" display="block">
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">WAI Data Tables</Heading>
          </Container>

          <TabList onChange={this.onExampleChange} selectedIndex={this.state.selectedTabIndex}>
            {examples.map(example => (
              <TabPanel key={example.label} title={example.label}>
                <example.component />
              </TabPanel>
            ))}
          </TabList>

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
