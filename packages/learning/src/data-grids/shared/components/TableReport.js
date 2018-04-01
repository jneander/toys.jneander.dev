import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Table from '@instructure/ui-core/lib/components/Table'

export default class TableReport extends PureComponent {
  static defaultProps = {
    data: {}
  }

  constructor(props) {
    super(props)

    this.state = {
      data: props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps.data)
  }

  update = (data = {}) => {
    this.setState({
      data: {
        ...this.state.data,
        ...data
      }
    })
  }

  render() {
    return (
      <Table
        caption={
          <Heading level="h3" margin="small">
            Debug Data
          </Heading>
        }
      >
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(this.state.data)
            .sort()
            .map(key => (
              <tr key={key}>
                <td>{key}</td>
                <td>{this.state.data[key]}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    )
  }
}
