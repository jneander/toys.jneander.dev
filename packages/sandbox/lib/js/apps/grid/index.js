import React from 'react';
import Container from 'instructure-ui/lib/components/Container';
import TabList, { TabPanel } from 'instructure-ui/lib/components/TabList';

import StructureOnly from './examples/StructureOnly';

const examples = [
  { label: 'Structure Only', component: StructureOnly }
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
