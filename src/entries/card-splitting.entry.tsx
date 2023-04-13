import {CardSplittingElement} from '../genetic-algorithms'

if (!customElements.get('card-splitting')) {
  window.customElements.define('card-splitting', CardSplittingElement)
}
