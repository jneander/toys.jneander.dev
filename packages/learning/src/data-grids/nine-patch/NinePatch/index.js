import React, {PureComponent} from 'react'

import Section from './Section'
import styles from './styles.css'

export default class NinePatch extends PureComponent {
  render() {
    return (
      <div className={styles.Container}>
        <Section
          contentWidth={this.props.sectionWidths[0]}
          frozen
          sectionHeights={this.props.sectionHeights}
        />

        <Section
          contentWidth={this.props.sectionWidths[1]}
          sectionHeights={this.props.sectionHeights}
        />

        <Section
          contentWidth={this.props.sectionWidths[2]}
          frozen
          sectionHeights={this.props.sectionHeights}
        />
      </div>
    )
  }
}
