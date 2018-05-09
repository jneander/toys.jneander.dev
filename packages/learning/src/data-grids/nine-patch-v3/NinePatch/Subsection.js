import React, {PureComponent} from 'react'

import ControlledView from './utils/ControlledView'
import FixedText from './utils/FixedText'
import styles from './styles.css'

export default class Subsection extends PureComponent {
  static defaultProps = {
    horizontalScroll: false,
    verticalScroll: false
  }

  constructor(props) {
    super(props)

    this._bindScrollParent = ref => {
      this._scrollParent = ref
    }

    this._bindFixedText = ref => {
      this._fixedText = ref
    }

    this._handleNodeScroll = () => {
      const {scrollLeft, scrollTop} = this._scrollParent
      this._fixedText.updateParentScrollPosition({left: scrollLeft, top: scrollTop})
    }
  }

  componentDidMount() {
    this._scrollParent.addEventListener('scroll', this._handleNodeScroll)
  }

  componentWillUnmount() {
    this._scrollParent.removeEventListener('scroll', this._handleNodeScroll)
  }

  render() {
    const contentStyle = {
      height: `${this.props.contentHeight}px`,
      width: `${this.props.contentWidth}px`
    }

    const className = this.props.verticalScroll
      ? styles.ScrollableSubsectionContainer
      : styles.FrozenSubsectionContainer

    let view = (
      <div className={className} ref={this._bindScrollParent}>
        <div className={styles.Subsection} style={contentStyle}>
          <FixedText ref={this._bindFixedText} />
        </div>
      </div>
    )

    const {horizontalScroll, verticalScroll} = this.props

    if (horizontalScroll || verticalScroll) {
      view = (
        <ControlledView horizontal={horizontalScroll} vertical={verticalScroll}>
          {view}
        </ControlledView>
      )
    }

    return view
  }
}
