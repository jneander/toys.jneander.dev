import React from 'react'

import KeyCodes from 'js/apps/wai-data-grid/shared/KeyCodes'
import styles from './css/styles.css'

const menuItems = ['Income', 'Groceries', 'Dining Out', 'Auto', 'Household', 'Beauty']

export default class DropDownCell extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      content: props.content,
      menuIsOpen: false,
      selectedMenuItem: null
    }
  }

  bindMenuButton = ref => {
    this.menuButton = ref
  }
  bindSelectedMenuItem = ref => {
    this.selectedMenuItem = ref
  }

  componentDidUpdate = (lastProps, lastState) => {
    if (this.selectedMenuItem) {
      this.selectedMenuItem.focus()
    } else if (lastState.menuIsOpen && !this.state.menuIsOpen) {
      this.menuButton.focus()
    }
  }

  focus = () => {
    if (this.menuButton) {
      this.menuButton.focus()
    }
  }

  onButtonClick = event => {
    this.setState({
      menuIsOpen: !this.state.menuIsOpen
    })
  }

  onButtonKeyDown = event => {
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

  onMenuItemClick = event => {
    this.setState({
      content: event.target.innerText,
      menuIsOpen: false,
      selectedMenuItem: null
    })
  }

  onMenuItemKeyDown = event => {
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
      <td className={styles.DropDownCell}>
        <button
          ref={this.bindMenuButton}
          className={styles.DropDownButton}
          tabIndex={this.props.isActive ? '0' : '-1'}
          aria-haspopup="true"
          aria-controls={menuId}
          onClick={this.onButtonClick}
          onKeyDown={this.onButtonKeyDown}
        >
          {this.state.content}
        </button>

        {this.state.menuIsOpen && (
          <ul className={styles.DropDownMenu} role="menu" id={menuId}>
            {menuItems.map((menuItem, index) => (
              <li
                key={menuItem}
                ref={this.state.selectedMenuItem === index ? this.bindSelectedMenuItem : null}
                className={styles.DropDownMenuItem}
                onClick={this.onMenuItemClick}
                onKeyDown={this.onMenuItemKeyDown}
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
