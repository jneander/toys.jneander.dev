import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class Subsection extends PureComponent {
  render() {
    const contentStyle = {
      height: `${this.props.contentHeight}px`,
      width: `${this.props.contentWidth}px`
    }

    const className = this.props.frozen
      ? styles.FrozenSubsectionContainer
      : styles.ScrollableSubsectionContainer

    return (
      <div className={className}>
        <div className={styles.Subsection} style={contentStyle}>
          <span>
            {this.props.contentWidth} x {this.props.contentHeight}
          </span>
        </div>
      </div>
    )
  }
}
