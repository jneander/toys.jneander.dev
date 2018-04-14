import React, {PureComponent} from 'react'

import KeyCodes from '../DataGrid/KeyCodes'
import styles from '../styles.css'
import cellStyles from './styles.css'

export default class NotesCell extends PureComponent {
  constructor(props) {
    super(props)

    this.bindButton = ref => {
      this.props.focusableRef && this.props.focusableRef(ref)
      this.button = ref
    }
    this.bindInput = ref => {
      this.props.focusableRef(ref)
      this.input = ref
    }

    this.focus = this.focus.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)
    this.handleButtonKeyDown = this.handleButtonKeyDown.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this)

    this.state = {
      isEditing: false,
      content: this.props.row[this.props.column.id]
    }
  }

  focus() {
    if (this.button) {
      this.button.focus()
    } else {
      this.input.focus()
    }
  }

  handleButtonClick(event) {
    this.setState({isEditing: true}, this.focus)
  }

  handleButtonKeyDown(event) {
    const key = event.which || event.keyCode
    if (key === KeyCodes.ENTER) {
      this.setState({isEditing: true}, this.focus)
    }
  }

  handleInputChange(event) {
    this.setState({
      content: event.target.value
    })
  }

  handleInputKeyDown(event) {
    switch (event.which || event.keyCode) {
      case KeyCodes.ENTER:
      case KeyCodes.ESC:
        event.preventDefault()
        this.setState({isEditing: false}, this.focus)
        break
      case KeyCodes.UP:
      case KeyCodes.DOWN:
      case KeyCodes.RIGHT:
      case KeyCodes.LEFT:
        event.stopPropagation()
        break
    }
  }

  render() {
    const {column, row} = this.props

    if (this.props.focusableRef) {
      this.props.focusableRef(this)
    }

    return (
      <td className={`${styles.Cell}`}>
        <div className="editable-text">
          {this.state.isEditing ? (
            <input
              className={cellStyles.EditTextInput}
              defaultValue={this.state.content}
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
              ref={this.bindInput}
              tabIndex={this.props.tabIndex}
            />
          ) : (
            <span
              className={cellStyles.NotesEditButton}
              onClick={this.handleButtonClick}
              onKeyDown={this.handleButtonKeyDown}
              ref={this.bindButton}
              role="button"
              tabIndex={this.props.tabIndex}
            >
              {this.state.content}
            </span>
          )}
        </div>
      </td>
    )
  }
}
