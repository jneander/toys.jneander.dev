import React from 'react'
import Container from '@instructure/ui-core/lib/components/Container'
import Link from '@instructure/ui-core/lib/components/Link'
import TabList, {TabPanel} from '@instructure/ui-core/lib/components/TabList'
import Text from '@instructure/ui-core/lib/components/Text'

import Example1 from './example-1'
import Example2 from './example-2'

const examples = [
  {label: 'Minimal Data Grid', component: Example1},
  {label: 'Sortable Data Grid With Editable Cells', component: Example2}
  // { label: 'Scrollable Data Grid With Column Hiding', component: Example3 }
]

export default class Grid extends React.PureComponent {
  state = {
    selectedTabIndex: 0
  }

  onExampleChange = tabIndex => {
    this.setState({selectedTabIndex: tabIndex})
  }

  render() {
    const Example = examples[this.state.selectedExample]

    return (
      <Container margin="large" display="block">
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
            <Link href="https://www.w3.org/TR/wai-aria-practices-1.1/">WAI-ARIA Authoring Practices 1.1</Link>. They
            have been recreated in React as an exercise in understanding how a data grid can be accessible.
          </p>
        </Text>
      </Container>
    )
  }
}
