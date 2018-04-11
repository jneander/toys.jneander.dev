import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'

import ScreenreaderReport from '../../shared/components/ScreenreaderReport'
import createGridData from '../../shared/example-data/createGridData'
import styles from './styles.css'
const structure = createGridData(5, 10)

const screenreaderOutput = [
  {action: 'Navigate to table', voiceover: '?'},
  {action: 'From Column A header, select Column B header', voiceover: '?'},
  {action: 'From Column A header, select next row', voiceover: '?'},
  {action: 'From Column B header, select next row', voiceover: '?'},
  {action: 'From A1, select B1', voiceover: '?'},
  {action: 'From A1, select Column A header', voiceover: '?'}
]

export default class GridWithoutRowHeaders extends PureComponent {
  render() {
    return (
      <div>
        <Container as="div" margin="0 0 medium">
          <div role="grid">
            <div role="row">
              {structure.columns.map(column => (
                <div className={styles.ColumnHeader} key={column.id} role="columnheader">
                  {column.name}
                </div>
              ))}
            </div>

            {structure.rows.map(row => (
              <div key={row.id} role="row">
                {structure.columns.map((column, index) => {
                  const className = index === 0 ? styles.RowHeader : styles.GridCell
                  const role = index === 0 ? 'rowheader' : 'gridcell'
                  return (
                    <div className={className} key={column.id} role={role}>
                      {row.data[column.id]}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Container>

        <Container as="div">
          <ScreenreaderReport data={screenreaderOutput} />
        </Container>
      </div>
    )
  }
}
