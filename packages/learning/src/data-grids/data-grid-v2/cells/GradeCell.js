import React, {PureComponent} from 'react'

import KeyCodes from '../DataGrid/KeyCodes'
import styles from '../DataGrid/styles.css'
import cellStyles from './styles.css'

const menuItems = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', '–']

export default class GradeCell extends PureComponent {
  constructor(props) {
    super(props)

    this.bindMenuButton = ref => {
      this.props.focusableRef && this.props.focusableRef(ref)
      this.menuButton = ref
    }
    this.bindSelectedMenuItem = ref => {
      this.selectedMenuItem = ref
    }

    this.focus = this.focus.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)
    this.handleButtonKeyDown = this.handleButtonKeyDown.bind(this)
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this)
    this.handleMenuItemKeyDown = this.handleMenuItemKeyDown.bind(this)

    this.state = {
      content: this.props.row[this.props.column.id] || '–',
      menuIsOpen: false,
      selectedMenuItem: null
    }
  }

  componentDidUpdate(lastProps, lastState) {
    this.props.focusableRef && this.props.focusableRef(this.menuButton)
    if (this.selectedMenuItem) {
      this.selectedMenuItem.focus()
    } else if (lastState.menuIsOpen && !this.state.menuIsOpen) {
      this.menuButton.focus()
    }
  }

  focus() {
    if (this.menuButton) {
      this.menuButton.focus()
    }
  }

  handleButtonClick(event) {
    this.setState({
      menuIsOpen: !this.state.menuIsOpen
    })
  }

  handleButtonKeyDown(event) {
    const key = event.which || event.keyCode

    switch (key) {
      case KeyCodes.SPACE:
        this.setState({
          menuIsOpen: true,
          selectedMenuItem: 0
        })
        break
      case KeyCodes.ENTER:
        this.setState({
          menuIsOpen: true,
          selectedMenuItem: 0
        })
        break
      case KeyCodes.TAB:
        if (this.state.menuIsOpen) {
          this.setState({menuIsOpen: false})
        }
        return
      default:
        return
    }

    event.stopPropagation()
    event.preventDefault()
  }

  handleMenuItemClick(event) {
    this.setState({
      content: event.target.innerText,
      menuIsOpen: false,
      selectedMenuItem: null
    })
  }

  handleMenuItemKeyDown(event) {
    const key = event.which || event.keyCode

    switch (key) {
      case KeyCodes.SPACE:
      case KeyCodes.ENTER:
        this.setState({
          content: event.target.innerText,
          menuIsOpen: false,
          selectedMenuItem: null
        })
        break
      case KeyCodes.UP:
        this.setState({
          selectedMenuItem: (this.state.selectedMenuItem + menuItems.length - 1) % menuItems.length
        })
        break
      case KeyCodes.DOWN:
        this.setState({
          selectedMenuItem: (this.state.selectedMenuItem + menuItems.length + 1) % menuItems.length
        })
        break
      case KeyCodes.TAB:
        this.setState({
          menuIsOpen: false,
          selectedMenuItem: null
        })
        break
      default:
        return
    }

    event.stopPropagation()
    event.preventDefault()
  }

  render() {
    const menuId = `menu${this.props.rowIndex}`

    return (
      <div
        aria-labelledby={`column-${this.props.column.id}-label`}
        className={`${styles.Cell} ${cellStyles.GradeCell}`}
        role="gridcell"
        style={{textAlign: 'center'}}
      >
        <button
          aria-controls={menuId}
          aria-haspopup="true"
          className={cellStyles.GradeMenuButton}
          onClick={this.handleButtonClick}
          onKeyDown={this.handleButtonKeyDown}
          ref={this.bindMenuButton}
          tabIndex={this.props.tabIndex}
        >
          {this.state.content}
        </button>

        {this.state.menuIsOpen && (
          <ul className={cellStyles.GradeMenu} role="menu" id={menuId}>
            {menuItems.map((menuItem, index) => (
              <li
                className={cellStyles.GradeMenuItem}
                key={menuItem}
                onClick={this.handleMenuItemClick}
                onKeyDown={this.handleMenuItemKeyDown}
                ref={this.state.selectedMenuItem === index ? this.bindSelectedMenuItem : null}
                role="menuitem"
                tabIndex="-1"
              >
                {menuItem}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
}
