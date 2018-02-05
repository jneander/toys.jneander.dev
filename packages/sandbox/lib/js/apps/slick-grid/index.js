import React from 'react';

import ApplyTheme from 'instructure-ui/lib/components/ApplyTheme';
import Heading from 'instructure-ui/lib/components/Heading';
import canvas from 'instructure-ui/lib/themes/canvas';

class SlickGridExamples extends React.Component {
  render () {
    return (
      <ApplyTheme theme={canvas}>
        <Heading level="h2">SlickGrid Pending</Heading>
      </ApplyTheme>
    );
  }
}

export default SlickGridExamples;
