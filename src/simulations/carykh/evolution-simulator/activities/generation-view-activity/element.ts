import './creature-info/element'

import {Store} from '@jneander/utils-state'
import {html} from 'lit'
import {ChangeEvent, ComponentProps, createElement} from 'react'
import {createRoot, Root} from 'react-dom/client'

import {RangeInputField} from '../../../../../shared/components'
import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import {FitnessDistributionChart, PercentilesChart, PopulationsChart} from '../../charts'
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

  private generationRangeRoot?: Root
  private percentilesChartRoot?: Root
  private populationsChartRoot?: Root
  private fitnessDistributionChartRoot?: Root

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

    this.generationRangeRoot?.unmount()

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

        <div class=${styles.GenerationRange} id="generation-range"></div>

        <p>
          <span>Generation ${selectedGeneration}</span>

          ${postGenerationContent}
        </p>

        <div class=${styles.Charts}>
          <div>
            <div class=${styles.ChartContainer} id="percentiles-chart"></div>

            <div class=${styles.PopulationsChartContainer} id="populations-chart"></div>
          </div>

          <div>
            <div class=${styles.Creatures}>${this.renderCreatures()}</div>

            <div class=${styles.ChartContainer} id="fitness-distribution-chart"></div>
          </div>
        </div>
      </div>
    `
  }

  protected firstUpdated(): void {
    const generationRangeContainer = this.querySelector('#generation-range')
    if (generationRangeContainer) {
      this.generationRangeRoot = createRoot(generationRangeContainer)
    }

    const percentilesContainer = this.querySelector('#percentiles-chart')
    if (percentilesContainer) {
      this.percentilesChartRoot = createRoot(percentilesContainer)
    }

    const populationsContainer = this.querySelector('#populations-chart')
    if (populationsContainer) {
      this.populationsChartRoot = createRoot(populationsContainer)
    }

    const fitnessDistributionContainer = this.querySelector('#fitness-distribution-chart')
    if (fitnessDistributionContainer) {
      this.fitnessDistributionChartRoot = createRoot(fitnessDistributionContainer)
    }

    this.renderCharts()
  }

  protected updated(): void {
    this.renderGenerationRange()
  }

  private renderGenerationRange(): void {
    const {generationCount, selectedGeneration} = this.store.getState()

    const props: ComponentProps<typeof RangeInputField> = {
      labelText: 'Displayed Generation',
      disabled: generationCount === 0,
      max: generationCount,
      min: Math.min(1, generationCount - 1),
      onChange: this.handleSelectedGenerationChange.bind(this),
      value: selectedGeneration,
    }

    this.generationRangeRoot?.render(createElement(RangeInputField, props))
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

  private renderCharts(): void {
    this.percentilesChartRoot?.render(createElement(PercentilesChart, {appStore: this.store}))
    this.populationsChartRoot?.render(createElement(PopulationsChart, {appStore: this.store}))
    this.fitnessDistributionChartRoot?.render(
      createElement(FitnessDistributionChart, {appStore: this.store}),
    )
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

  private handleSelectedGenerationChange(event: ChangeEvent<HTMLInputElement>): void {
    const {selectedGeneration} = this.store.getState()
    const value = Number.parseInt(event.target.value, 10)

    if (value !== selectedGeneration) {
      this.store.setState({selectedGeneration: value})
    }
  }
}

defineElement('generation-view-activity', GenerationViewActivityElement)
