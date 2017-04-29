import React from 'react';
import Container from 'instructure-ui/lib/components/Container';
import TabList, { TabPanel } from 'instructure-ui/lib/components/TabList';

import WaiDataGrid1 from './example-1';
import WaiDataGrid2 from './example-2';

const examples = [
  { label: 'WAI-ARIA Data Grid 1', component: WaiDataGrid1 },
  { label: 'WAI-ARIA Data Grid 2', component: WaiDataGrid2 }
];

export default class Grid extends React.PureComponent {
  state = {
    selectedTabIndex: 0
  };

  onExampleChange = (tabIndex) => {
    this.setState({ selectedTabIndex: tabIndex });
  }

  render () {
    const Example = examples[this.state.selectedExample];

    return (
      <Container margin="large" display="block">
        <TabList
          onChange={this.onExampleChange}
          selectedIndex={this.state.selectedTabIndex}
        >
          {
            examples.map(example => (
              <TabPanel key={example.label} title={example.label}>
                <example.component />
              </TabPanel>
            ))
          }
        </TabList>
      </Container>
    );
  }
}
