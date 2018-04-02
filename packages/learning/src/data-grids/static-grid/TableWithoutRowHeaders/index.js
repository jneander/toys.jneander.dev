import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'

import createGridData from '../../shared/example-data/createGridData'
import ScreenreaderReport from '../shared/ScreenreaderReport'

const structure = createGridData(5, 10)

const screenreaderOutput = [
  {action: 'Navigate to table', voiceover: 'Example Data, table 5 columns, 11 rows'},
  {action: 'From Column A header, select Column B header', voiceover: 'Column B, column 2 of 5'},
  {action: 'From Column A header, select next row', voiceover: 'Row 2 of 11, A1'},
  {action: 'From Column B header, select next row', voiceover: 'Row 2 of 11, B1'},
  {action: 'From A1, select B1', voiceover: 'Column B, B1, column 2 of 5'},
  {action: 'From A1, select Column A header', voiceover: 'Row 1 of 11, Column A'}
]

export default class TableWithoutRowHeaders extends PureComponent {
  render() {
    return (
      <div>
        <Container as="div" margin="0 0 medium">
          <table>
            <caption>Example Data</caption>

            <thead>
              <tr>{structure.columns.map(column => <th key={column.id}>{column.name}</th>)}</tr>
            </thead>

            <tbody>
              {structure.rows.map(row => (
                <tr key={row.id}>
                  {structure.columns.map(column => <td key={column.id}>{row.data[column.id]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Container>

        <Container as="div">
          <ScreenreaderReport data={screenreaderOutput} />
        </Container>
      </div>
    )
  }
}
