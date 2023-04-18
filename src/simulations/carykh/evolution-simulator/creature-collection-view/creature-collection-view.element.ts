import '../p5-utils/p5-view-element'

import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../shared/views'
import type {P5ViewAdapter} from '../p5-utils'
import {CREATURE_COLLECTION_VIEW_HEIGHT, CREATURE_COLLECTION_VIEW_WIDTH} from './constants'

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
        <p5-view
          .clientViewAdapter=${this.adapter}
          height="${CREATURE_COLLECTION_VIEW_HEIGHT}"
          scale="1"
          width="${CREATURE_COLLECTION_VIEW_WIDTH}"
        ></p5-view>
      </div>
    `
  }
}

defineElement('creature-collection-view', CreatureCollectionViewElement)