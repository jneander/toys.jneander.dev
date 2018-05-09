import React, {PureComponent} from 'react'

import ViewController from './utils/ViewController'
import Section from './Section'
import styles from './styles.css'

export default class NinePatch extends PureComponent {
  render() {
    return (
      <ViewController>
        {() => (
          <div className={styles.Container}>
            <Section
              contentWidth={this.props.sectionWidths[0]}
              sectionHeights={this.props.sectionHeights}
            />

            <Section
              contentWidth={this.props.sectionWidths[1]}
              horizontalScroll
              sectionHeights={this.props.sectionHeights}
            />

            <Section
              contentWidth={this.props.sectionWidths[2]}
              sectionHeights={this.props.sectionHeights}
            />
          </div>
        )}
      </ViewController>
    )
  }
}
