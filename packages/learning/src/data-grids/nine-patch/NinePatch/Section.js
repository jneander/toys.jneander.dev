import React, {PureComponent} from 'react'

import Subsection from './Subsection'
import styles from './styles.css'

export default class Section extends PureComponent {
  static defaultProps = {
    horizontalScroll: false
  }

  render() {
    const className = this.props.horizontalScroll ? styles.ScrollableSection : styles.FrozenSection

    return (
      <div className={className}>
        <Subsection
          contentHeight={this.props.sectionHeights[0]}
          contentWidth={this.props.contentWidth}
          horizontalScroll={this.props.horizontalScroll}
        />

        <Subsection
          contentHeight={this.props.sectionHeights[1]}
          contentWidth={this.props.contentWidth}
          horizontalScroll={this.props.horizontalScroll}
          verticalScroll
        />

        <Subsection
          contentHeight={this.props.sectionHeights[2]}
          contentWidth={this.props.contentWidth}
          horizontalScroll={this.props.horizontalScroll}
        />
      </div>
    )
  }
}
