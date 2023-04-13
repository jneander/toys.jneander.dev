import {KnightCoveringElement} from '../genetic-algorithms'

if (!customElements.get('knight-covering')) {
  window.customElements.define('knight-covering', KnightCoveringElement)
}
