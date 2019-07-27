import React, {PureComponent} from 'react'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'
import Table from '@instructure/ui-elements/lib/components/Table'

export default class Metrics extends PureComponent {
  render() {
    return (
      <Table
        caption={<ScreenReaderContent>Metrics</ScreenReaderContent>}
        margin={this.props.margin}
      >
        <tbody>
          <tr>
            <td scope="row">Iteration</td>
            <td style={{textAlign: 'right'}}>{this.props.iteration}</td>
          </tr>
        </tbody>
      </Table>
    )
  }
}
