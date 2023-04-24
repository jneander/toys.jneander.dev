import {html} from 'lit'
import {ifDefined} from 'lit/directives/if-defined.js'

import {BaseElement, defineElement} from '../../views'

import styles from './styles.module.scss'

export class NumberInputFieldElement extends BaseElement {
  private declare disabled: boolean
  private declare labelText: string
  private declare max: number
  private declare min: number
  private declare step: number
  private declare value: boolean

  static get properties() {
    return {
      disabled: {type: Boolean},
      labelText: {type: String},
      max: {type: Number},
      min: {type: Number},
      step: {type: Number},
      value: {type: String},
    }
  }

  protected render() {
    return html`
      <label class=${styles.InputContainer}>
        <span class=${styles.InputLabelContent}>${this.labelText}</span>

        <input
          class=${styles.NumberInputField}
          ?disabled=${this.disabled}
          max=${ifDefined(this.max)}
          min=${ifDefined(this.min)}
          step=${ifDefined(this.step)}
          type="number"
          .value=${this.value}
        />
      </label>
    `
  }
}

defineElement('number-input-field', NumberInputFieldElement)
