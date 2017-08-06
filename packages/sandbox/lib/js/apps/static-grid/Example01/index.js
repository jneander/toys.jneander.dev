import React from 'react';

import createGridData from 'js/shared/example-data/createGridData';

const structure = createGridData(5, 10);

export default class Example01 extends React.PureComponent {
  render () {
    return (
      <table>
        <thead>
          <tr>
            {
              structure.columns.map((column) => (
                <th key={column.id}>{ column.name }</th>
              ))
            }
          </tr>
        </thead>

        <tbody>
          {
            structure.rows.map((row) => (
              <tr key={row.id}>
                {
                  structure.columns.map((column) => (
                    <td key={column.id}>{ row.data[column.id] }</td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
}
