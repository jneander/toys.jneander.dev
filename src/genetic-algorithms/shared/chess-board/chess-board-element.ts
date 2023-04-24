import {html} from 'lit'

import {BaseElement, defineElement} from '../../../shared/views'
import {buildPopulatedBoard} from './helpers'
import type {ChessBoardPosition} from './types'

import styles from './styles.module.scss'

export class ChessBoardElement extends BaseElement {
  private declare positions?: ChessBoardPosition[]
  private declare size: number

  static get properties() {
    return {
      positions: {type: Array},
      size: {type: Number},
    }
  }

  protected render() {
    const {positions, size} = this

    const board = buildPopulatedBoard(size, positions)

    return html`
      <table aria-label="Chess Board" class=${styles.Board}>
        <tbody>
          ${board.map(
            row => html`
              <tr class=${styles.Row}>
                ${row.map(piece => html` <td class=${styles.Space}>${piece}</td> `)}
              </tr>
            `,
          )}
        </tbody>
      </table>
    `
  }
}

defineElement('chess-board', ChessBoardElement)
