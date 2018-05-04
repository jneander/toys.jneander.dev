import React, {PureComponent} from 'react'

import Subsection from './Subsection'
import styles from './styles.css'

export default class Section extends PureComponent {
  render() {
    return (
      <div className={this.props.frozen ? styles.FrozenSection : styles.ScrollableSection}>
        <Subsection
          contentHeight={this.props.sectionHeights[0]}
          contentWidth={this.props.contentWidth}
          frozen
        />

        <Subsection
          contentHeight={this.props.sectionHeights[1]}
          contentWidth={this.props.contentWidth}
        />

        <Subsection
          contentHeight={this.props.sectionHeights[2]}
          contentWidth={this.props.contentWidth}
          frozen
        />
      </div>
    )
  }
}
