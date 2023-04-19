import '../p5-utils/p5-view-element'

import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../shared/views'
import type {P5ViewAdapter} from '../p5-utils'

import styles from './styles.module.scss'

export class CreatureCollectionViewElement extends BaseElement {
  private declare adapter: P5ViewAdapter

  static get properties() {
    return {
      adapter: {type: Object},
    }
  }

  protected render() {
    return html`
      <div class="${styles.Container}">
        <p5-view .adapter=${this.adapter}></p5-view>
      </div>
    `
  }
}

defineElement('creature-collection-view', CreatureCollectionViewElement)
