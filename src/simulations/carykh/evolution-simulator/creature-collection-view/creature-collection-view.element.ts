import '../p5-utils/p5-controlled-client-view.element'

import {html, LitElement} from 'lit'

import type {P5ClientViewAdapter} from '../p5-utils'
import {CREATURE_COLLECTION_VIEW_HEIGHT, CREATURE_COLLECTION_VIEW_WIDTH} from './constants'

import styles from './styles.module.scss'

export class CreatureCollectionViewElement extends LitElement {
  private declare adapter: P5ClientViewAdapter

  static get properties() {
    return {
      adapter: {type: Object},
    }
  }

  createRenderRoot() {
    return this
  }

  protected render() {
    return html`
      <div class="${styles.Container}">
        <p5-controlled-client-view
          .clientViewAdapter=${this.adapter}
          height="${CREATURE_COLLECTION_VIEW_HEIGHT}"
          scale="1"
          width="${CREATURE_COLLECTION_VIEW_WIDTH}"
        ></p5-controlled-client-view>
      </div>
    `
  }
}

if (!customElements.get('creature-collection-view')) {
  window.customElements.define('creature-collection-view', CreatureCollectionViewElement)
}
