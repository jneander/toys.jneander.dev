import React, {Component} from 'react'

import styles from './DataTable/styles.css'

export default class DescriptionColumnHeader extends Component {
  render() {
    return (
      <td key={this.props.key} className={styles.Cell}>
        <a href="#" ref={this.props.focusableRef} tabIndex={this.props.tabIndex}>
          {this.props.data}
        </a>
      </td>
    )
  }
}
