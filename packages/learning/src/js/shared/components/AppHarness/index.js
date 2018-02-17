import React, {PureComponent} from 'react'

import Header from '../Header'

export default class AppHarness extends PureComponent {
  render() {
    return (
      <div>
        <Header page={this.props.page} />
        {this.props.children}
      </div>
    )
  }
}
