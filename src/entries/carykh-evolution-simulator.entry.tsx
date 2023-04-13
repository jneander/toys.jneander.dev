import {CarykhEvolutionSimulatorElement} from '../simulations'

if (!customElements.get('carykh-evolution-simulator')) {
  window.customElements.define('carykh-evolution-simulator', CarykhEvolutionSimulatorElement)
}
