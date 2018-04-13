import React, {PureComponent} from 'react'

import KeyCodes from '../shared/KeyCodes'
import styles from '../shared/DataTable/styles.css'
import sortableStyles from './css/styles.css'

const menuItems = ['Income', 'Groceries', 'Dining Out', 'Auto', 'Household', 'Beauty']

export default class DropDownCell extends PureComponent {
  constructor(props) {
    super(props)

    this.bindMenuButton = ref => {
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
      content: this.props.row[this.props.column.id],
      menuIsOpen: false,
      selectedMenuItem: null
    }
  }

  componentDidUpdate(lastProps, lastState) {
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
      case KeyCodes.UP:
        this.setState({
          menuIsOpen: true,
          selectedMenuItem: menuItems.length - 1
        })
        break
      case KeyCodes.DOWN:
        this.setState({
          menuIsOpen: true,
          selectedMenuItem: 0
        })
        break
      case KeyCodes.TAB:
        this.setState({menuIsOpen: false})
        break
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
      <td className={sortableStyles.DropDownCell}>
        <button
          ref={this.bindMenuButton}
          className={sortableStyles.DropDownButton}
          tabIndex={this.props.tabIndex}
          aria-haspopup="true"
          aria-controls={menuId}
          onClick={this.handleButtonClick}
          onKeyDown={this.handleButtonKeyDown}
        >
          {this.state.content}
        </button>

        {this.state.menuIsOpen && (
          <ul className={sortableStyles.DropDownMenu} role="menu" id={menuId}>
            {menuItems.map((menuItem, index) => (
              <li
                key={menuItem}
                ref={this.state.selectedMenuItem === index ? this.bindSelectedMenuItem : null}
                className={sortableStyles.DropDownMenuItem}
                onClick={this.handleMenuItemClick}
                onKeyDown={this.handleMenuItemKeyDown}
                role="menuitem"
                tabIndex="-1"
              >
                {menuItem}
              </li>
            ))}
          </ul>
        )}
      </td>
    )
  }
}
