import React from 'react';
import Container from '@instructure/ui-core/lib/components/Container';
import Heading from '@instructure/ui-core/lib/components/Heading';

import AppHarness from 'js/shared/components/AppHarness';

export default class Home extends React.Component {
  render () {
    return (
      <AppHarness page="home">
        <Container as="div" padding="medium">
          <Heading level="h2">Work in Progress</Heading>
        </Container>
      </AppHarness>
    );
  }
}
