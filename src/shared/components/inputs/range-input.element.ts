import {html, nothing} from 'lit'
import {ifDefined} from 'lit/directives/if-defined.js'

import {BaseElement, defineElement} from '../../views'

import styles from './styles.module.scss'

export class RangeInputFieldElement extends BaseElement {
  private declare disabled: boolean
  private declare labelText: string
  private declare max: number
  private declare min: number
  private declare step: number
  private declare value: number

  static get properties() {
    return {
      disabled: {type: Boolean},
      labelText: {type: String},
      max: {type: Number},
      min: {type: Number},
      step: {type: Number},
      value: {type: Number},
    }
  }

  protected render(): unknown {
    return html`
      <label class=${styles.InputContainer}>
        <div class=${styles.InputLabelContent}>${this.labelText}</div>

        <input
          class=${styles.RangeInputField}
          ?disabled=${this.disabled ?? nothing}
          max=${ifDefined(this.max)}
          min=${ifDefined(this.min)}
          step=${ifDefined(this.step)}
          type="range"
          .value=${ifDefined(this.value)}
        />
      </label>
    `
  }
}

defineElement('range-input-field', RangeInputFieldElement)
