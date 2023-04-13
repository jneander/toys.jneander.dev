import {SortingNumbersElement} from '../genetic-algorithms'

if (!customElements.get('sorting-numbers')) {
  window.customElements.define('sorting-numbers', SortingNumbersElement)
}
