import {html} from 'lit'

import {BaseElement, defineElement} from '../../views'

import styles from './styles.module.scss'

export class CheckboxInputFieldElement extends BaseElement {
  private declare checked: boolean
  private declare disabled: boolean
  private declare labelText: string

  static get properties() {
    return {
      checked: {type: Boolean},
      disabled: {type: Boolean},
      labelText: {type: String},
    }
  }

  protected render() {
    return html`
      <label class=${styles.CheckboxInputField}>
        <input ?checked=${this.checked} ?disabled=${this.disabled} type="checkbox" />

        <span>${this.labelText}</span>
      </label>
    `
  }
}

defineElement('checkbox-input-field', CheckboxInputFieldElement)
