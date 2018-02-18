import React, {PureComponent} from 'react'

import Header from '../Header'

import 'normalize.css'
import './styles.css'

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
