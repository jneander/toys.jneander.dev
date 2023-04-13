import {OneMaxElement} from '../genetic-algorithms'

if (!customElements.get('one-max')) {
  window.customElements.define('one-max', OneMaxElement)
}
