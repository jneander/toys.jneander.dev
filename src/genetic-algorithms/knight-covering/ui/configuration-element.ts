import '../../../shared/components/inputs/number-input.element'

import {html} from 'lit'

import {BaseElement, defineElement} from '../../../shared/views'
import {MAXIMUM_BOARD_SIZE, MINIMUM_BOARD_SIZE} from '../constants'

export class KnightCoveringConfigurationElement extends BaseElement {
  private declare boardSize: number
  private declare disabled: boolean
  private declare onBoardSizeChange: (size: number) => void

  static get properties() {
    return {
      boardSize: {type: Number},
      disabled: {type: Boolean},
      onBoardSizeChange: {type: Function},
    }
  }

  protected render() {
    return html`
      <div style="max-width: 10rem;">
        <number-input-field
          ?disabled=${this.disabled}
          @input=${this.handleBoardSizeChange}
          labelText="Board Size"
          max=${MAXIMUM_BOARD_SIZE}
          min=${MINIMUM_BOARD_SIZE}
          step="1"
          value=${this.boardSize}
        />
      </div>
    `
  }

  handleBoardSizeChange(event: Event) {
    const size = Number.parseInt((event.target as HTMLInputElement).value, 10)

    if (size >= MINIMUM_BOARD_SIZE && size <= MAXIMUM_BOARD_SIZE) {
      this.onBoardSizeChange(size)
    }
  }
}

defineElement('knight-covering-configuration', KnightCoveringConfigurationElement)
