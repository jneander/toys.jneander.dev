import React, {PureComponent} from 'react'

import Header from '../Header'
import Sidebar from '../Sidebar'

import 'normalize.css'
import './styles.css'

export default class Layout extends PureComponent {
  render() {
    return (
      <div>
        <Header />

        <div style={{display: 'flex', flexDirection: 'row'}}>
          <Sidebar page={this.props.page} />

          <main style={{overflow: 'hidden'}}>{this.props.children}</main>
        </div>
      </div>
    )
  }
}
