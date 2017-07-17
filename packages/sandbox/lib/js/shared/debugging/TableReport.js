import React from 'react';

import Heading from 'instructure-ui/lib/components/Heading';
import Table from 'instructure-ui/lib/components/Table';

export default function TableReport (props) {
  return (
    <Table caption={<Heading level="h3" margin="small">Debug Data</Heading>}>
      <thead>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
      </thead>

      <tbody>
        {
          Object.keys(props.data).sort().map(key => (
            <tr key={key}>
              <td>{ key }</td>
              <td>{ props.data[key] }</td>
            </tr>
          ))
        }
      </tbody>
    </Table>
  );
}
