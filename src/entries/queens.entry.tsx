import {QueensElement} from '../genetic-algorithms'

if (!customElements.get('ga-queens')) {
  window.customElements.define('ga-queens', QueensElement)
}
