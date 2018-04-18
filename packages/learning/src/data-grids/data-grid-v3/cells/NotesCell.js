import React, {PureComponent} from 'react'
import Button from '@instructure/ui-buttons/lib/components/Button'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'
import TextInput from '@instructure/ui-forms/lib/components/TextInput'
import KeyCodes from '@jneander/data-grid/src/utils/KeyCodes'

import styles from './styles.css'

function NotesInput(props) {
  return (
    <TextInput
      aria-labelledby={props['aria-labelledby']}
      defaultValue={props.defaultValue}
      label={<ScreenReaderContent>Notes</ScreenReaderContent>}
      onChange={props.onChange}
      onKeyDown={props.onKeyDown}
      ref={ref => props.inputRef(ref)}
      size="small"
      tabIndex={props.tabIndex}
    />
  )
}

function EditButton(props) {
  return (
    <span
      aria-labelledby={props['aria-labelledby']}
      className={`${styles.Cell} ${styles.NotesCell}`}
      role="gridcell"
      tabIndex={props.tabIndex}
    >
      {props.children}

      <span
        className={styles.NotesEditButton}
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        ref={props.buttonRef}
        role="button"
        tabIndex={props.tabIndex}
      >
        <ScreenReaderContent>Edit</ScreenReaderContent>
      </span>
    </span>
  )
}

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

    if (this.state.isEditing) {
      return (
        <NotesInput
          aria-labelledby={`row-${row.id}-label column-${column.id}-label`}
          className={`${styles.Cell} ${styles.NotesCell}`}
          defaultValue={this.state.content}
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKeyDown}
          inputRef={this.bindInput}
          role="gridcell"
        >
          {this.state.content || '–'}
        </NotesInput>
      )
    }

    if (this.props.isActiveLocation) {
      return (
        <EditButton
          aria-labelledby={`row-${row.id}-label column-${column.id}-label`}
          buttonRef={ref => this.bindButton(ref)}
          onClick={this.handleButtonClick}
          onKeyDown={this.handleButtonKeyDown}
          tabIndex={this.props.tabIndex}
        >
          {this.state.content || '–'}
        </EditButton>
      )
    }

    return (
      <span
        aria-labelledby={`row-${row.id}-label column-${column.id}-label`}
        className={`${styles.Cell} ${styles.NotesCell}`}
        ref={ref => this.bindButton(ref)}
        role="gridcell"
        tabIndex={this.props.tabIndex}
      >
        {this.state.content || '–'}
      </span>
    )
  }
}
