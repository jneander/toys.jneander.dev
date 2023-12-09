import '../../../../../shared/components/inputs/range-input.element'
import '../../charts/fitness-distribution/element'
import '../../charts/percentiles/element'
import '../../charts/populations/element'
import './creature-info/element'

import {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {GenerationSimulationMode} from './constants'
import type {ActivityState} from './types'

import styles from './styles.module.scss'

export class GenerationViewActivityElement extends BaseElement {
  public declare controller: AppController
  public declare store: AppStore

  private activityStore?: Store<ActivityState>
  private activityController?: ActivityController

  private storeListeners: (() => void)[] = []

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  connectedCallback(): void {
    this.activityStore = new Store<ActivityState>({
      currentGenerationSimulation: null,
      generationSimulationMode: GenerationSimulationMode.Off,
      pendingGenerationCount: 0,
    })

    this.activityController = new ActivityController({
      activityStore: this.activityStore,
      appController: this.controller,
      appStore: this.store,
    })

    this.storeListeners.push(this.store.subscribe(() => this.requestUpdate()))
    this.storeListeners.push(this.activityStore.subscribe(() => this.requestUpdate()))

    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.storeListeners.forEach(fn => {
      fn()
    })

    this.storeListeners.length = 0

    super.disconnectedCallback()
  }

  protected render() {
    const {selectedGeneration} = this.store.getState()
    const {currentGenerationSimulation, pendingGenerationCount} =
      this.activityStore?.getState() ?? {}

    let displayedPendingGenerationCount = pendingGenerationCount ?? 0

    if (pendingGenerationCount === 0 && currentGenerationSimulation) {
      displayedPendingGenerationCount = 1
    }

    let postGenerationContent: ReturnType<typeof html> | undefined

    if (displayedPendingGenerationCount === 1) {
      postGenerationContent = html` — <span>Simulating next generation...</span>`
    } else if (displayedPendingGenerationCount > 1) {
      postGenerationContent = html` —
        <span>Simulating next ${displayedPendingGenerationCount} generations...</span>`
    }

    return html`
      <div class=${styles.Layout}>
        <div class=${styles.Actions}>
          <button @click=${this.handleStepByStepClick} type="button">
            Do 1 step-by-step generation
          </button>

          <button @click=${this.handleQuickClick} type="button">Do 1 quick generation</button>

          <button @click=${this.handleAsapClick} type="button">Do 1 gen ASAP</button>

          <button @click=${this.handleAlapClick} type="button">Do gens ALAP</button>

          <button @click=${this.handleEndAlapClick} type="button">End ALAP</button>
        </div>

        <div class=${styles.GenerationRange}>${this.renderGenerationRange()}</div>

        <p>
          <span>Generation ${selectedGeneration}</span>

          ${postGenerationContent}
        </p>

        <div class=${styles.Charts}>
          <div>
            <div class=${styles.ChartContainer}>
              <percentiles-chart .store=${this.store}></percentiles-chart>
            </div>

            <div class=${styles.PopulationsChartContainer}>
              <populations-chart .store=${this.store}></populations-chart>
            </div>
          </div>

          <div>
            <div class=${styles.Creatures}>${this.renderCreatures()}</div>

            <div class=${styles.ChartContainer}>
              <fitness-distribution-chart .store=${this.store}></fitness-distribution-chart>
            </div>
          </div>
        </div>
      </div>
    `
  }

  private renderGenerationRange() {
    const {generationCount, selectedGeneration} = this.store.getState()

    return html`
      <range-input-field
        @input=${this.handleSelectedGenerationChange}
        ?disabled=${generationCount === 0}
        labelText="Displayed Generation"
        .max=${generationCount}
        .min=${Math.min(1, generationCount - 1)}
        .value=${selectedGeneration}
      ></range-input-field>
    `
  }

  private renderCreatures() {
    const historyEntry = this.activityController?.getSelectedGenerationHistoryEntry()

    if (historyEntry == null) {
      return null
    }

    const simulationConfig = this.controller.getSimulationConfig()

    const {bestCreature, medianCreature, worstCreature} = historyEntry

    return html`
      <creature-info
        .creature=${bestCreature}
        rankText="Best"
        .simulationConfig=${simulationConfig}
      ></creature-info>

      <creature-info
        .creature=${medianCreature}
        rankText="Median"
        .simulationConfig=${simulationConfig}
      ></creature-info>

      <creature-info
        .creature=${worstCreature}
        rankText="Worst"
        .simulationConfig=${simulationConfig}
      ></creature-info>
    `
  }

  private handleStepByStepClick(): void {
    this.activityController?.performStepByStepSimulation()
  }

  private handleQuickClick(): void {
    this.activityController?.performQuickGenerationSimulation()
  }

  private handleAsapClick(): void {
    this.activityController?.performAsapGenerationSimulation()
  }

  private handleAlapClick(): void {
    this.activityController?.startAlapGenerationSimulation()
  }

  private handleEndAlapClick(): void {
    this.activityController?.endAlapGenerationSimulation()
  }

  private handleSelectedGenerationChange(event: Event): void {
    const {selectedGeneration} = this.store.getState()
    const value = Number.parseInt((event.target as HTMLInputElement).value)

    if (value !== selectedGeneration) {
      this.store.setState({selectedGeneration: value})
    }
  }
}

defineElement('generation-view-activity', GenerationViewActivityElement)
