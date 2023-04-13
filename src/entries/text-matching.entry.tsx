import {TextMatchingElement} from '../genetic-algorithms'

if (!customElements.get('text-matching')) {
  window.customElements.define('text-matching', TextMatchingElement)
}
