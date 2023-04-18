import '../../../p5-utils/p5-view-element'

import {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../../shared/views'
import {Creature, getSpeciesColorHslString, speciesIdForCreature} from '../../../creatures'
import type {SimulationConfig} from '../../../simulation'
import {CreatureInfoAdapter} from './creature-info-adapter'
import type {CreatureInfoState} from './types'

import styles from './styles.module.scss'

export class CreatureInfoElement extends BaseElement {
  private declare creature: Creature
  private declare rankText: string
  private declare simulationConfig: SimulationConfig

  private store: Store<CreatureInfoState>
  private viewAdapter?: CreatureInfoAdapter

  static get properties() {
    return {
      creature: {type: Object},
      rankText: {type: String},
      simulationConfig: {type: Object},
    }
  }

  constructor() {
    super()

    this.store = new Store<CreatureInfoState>({
      showSimulation: false,
    })
  }

  protected update(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('creature')) {
      this.viewAdapter = new CreatureInfoAdapter({
        creature: this.creature,
        creatureInfoStore: this.store,
        simulationConfig: this.simulationConfig,
      })
    }

    super.update(changedProperties)
  }

  protected render() {
    const {creature} = this

    const speciesId = speciesIdForCreature(creature)
    const color = getSpeciesColorHslString(speciesId, false)

    return html`
      <div class=${styles.Container}>
        <div class=${styles.CanvasContainer}>
          <p5-view
            .adapter=${this.viewAdapter}
            .height=${240}
            @mouseenter=${this.handleMouseEnter}
            @mouseleave=${this.handleMouseLeave}
            .width=${240}
          />
        </div>

        <dl class=${styles.Details}>
          <dt>Rank</dt>
          <dl>${this.rankText}</dl>

          <dt>ID</dt>
          <dl>${creature.id}</dl>

          <dt>Fitness</dt>
          <dl class=${styles.FitnessValue}>${creature.fitness.toFixed(3)}</dl>

          <dt>Species</dt>
          <dl style="color: ${color};">${speciesIdForCreature(creature)}</dl>
        </dl>
      </div>
    `
  }

  private handleMouseEnter() {
    this.store?.setState({showSimulation: true})
  }

  private handleMouseLeave() {
    this.store?.setState({showSimulation: false})
  }
}

defineElement('creature-info', CreatureInfoElement)
