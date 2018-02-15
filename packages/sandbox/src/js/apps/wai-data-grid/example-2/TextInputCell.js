import React from 'react'

import styles from './css/styles.css'

export default class TextInputCell extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isEditing: false,
      content: props.content || ''
    }
  }

  bindButton = ref => {
    this.button = ref
  }
  bindInput = ref => {
    this.input = ref
  }

  focus = () => {
    if (this.button) {
      this.button.focus()
    } else {
      this.input.focus()
    }
  }

  onButtonClick = event => {
    this.setState({isEditing: true}, this.focus)
  }

  onButtonKeyDown = event => {
    if (event.which === 13) {
      this.setState({isEditing: true}, this.focus)
    }
  }

  onInputChange = event => {
    this.setState({
      content: event.target.value
    })
  }

  onInputKeyDown = event => {
    if (event.which === 13 || event.which === 27) {
      event.preventDefault()
      this.setState({isEditing: false}, this.focus)
    } else if ([37, 38, 39, 40].includes(event.which)) {
      event.stopPropagation()
    }
  }

  render() {
    const tabIndex = this.props.isActive ? '0' : '-1'

    return (
      <td className={styles.GridCell}>
        <div className="editable-text">
          {this.state.isEditing ? (
            <input
              ref={this.bindInput}
              onChange={this.onInputChange}
              onKeyDown={this.onInputKeyDown}
              className={styles.EditTextInput}
              tabIndex={tabIndex}
              defaultValue={this.state.content}
            />
          ) : (
            <span
              ref={this.bindButton}
              onClick={this.onButtonClick}
              onKeyDown={this.onButtonKeyDown}
              className={styles.EditTextButton}
              tabIndex={tabIndex}
              role="button"
            >
              {this.state.content}
            </span>
          )}
        </div>
      </td>
    )
  }
}
