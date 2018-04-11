import React, {PureComponent} from 'react'
import canvas from '@instructure/ui-themes/lib/canvas'

import Sidebar from '../Sidebar'

import 'normalize.css'
import styles from './styles.css'

canvas.use()

export default class Layout extends PureComponent {
  render() {
    return (
      <div className={styles.Layout}>
        <Sidebar page={this.props.page} />

        <main className={styles.Main}>{this.props.children}</main>
      </div>
    )
  }
}
