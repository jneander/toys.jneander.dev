import React from 'react';

import KeyCodes from 'js/apps/wai-data-grid/shared/KeyCodes';

import DropDownCell from './DropDownCell';
import TextCell from './TextCell';
import TextInputCell from './TextInputCell';
import data from './data';
import styles from './css/styles.css';

function renderRow (datum, rowIndex, grid) {
  const { row, column } = grid.state.focusPointer;
  const tabIndexFor = columnIndex => column === columnIndex && row === rowIndex ? '0' : '-1';
  const refFor = columnIndex => column === columnIndex && row === rowIndex ? grid.bindFocusedCell : undefined;
  const cellIsActive = columnIndex => column === columnIndex && row === rowIndex;

  return (
    <tr key={rowIndex}>
      <TextCell ref={refFor(0)} isActive={cellIsActive(0)} content={datum.date} />
      <TextCell ref={refFor(1)} isActive={cellIsActive(1)} content={datum.type} />
      <TextInputCell ref={refFor(2)} isActive={cellIsActive(2)} content={datum.description} />
      <DropDownCell ref={refFor(3)} isActive={cellIsActive(3)} content={datum.category} rowIndex={rowIndex} />
      <TextCell ref={refFor(4)} isActive={cellIsActive(4)} content={datum.amount} />
      <TextCell ref={refFor(5)} isActive={cellIsActive(5)} content={datum.balance} />
    </tr>
  );
}

function getCellFromEvent (event, grid) {
  const rows = grid.table.querySelectorAll('tbody tr');
  const row = [].findIndex.call(rows, row => row.contains(event.target));
  if (row > -1) {
    const column = [].findIndex.call(rows[row].children, cell => cell.contains(event.target));
    return { column, row: row - 1 };
  }
  return {};
}

export default class WaiDataGrid1 extends React.Component {
  state = {
    focusPointer: {
      column: 0,
      row: 0
    },
    rowWithOpenCategoryMenu: null
  };

  bindFocusedCell = (ref) => {
    this.activeCell = ref;
  };

  bindTableRef = (ref) => {
    this.table = ref;
  };

  focusCell = ({ column, row }) => {
    if (row >= 0 && row < data.length) {
      if (column >= 0 && column < 6) {
        this.setState({
          focusPointer: { column, row }
        }, () => {
          if (this.activeCell) {
            this.activeCell.focus();
          }
        });
      }
    }
  };

  handleBlur = (event) => {
    this.setState({
      hasFocus: false
    });
  };

  handleClick = (event) => {
    const cell = getCellFromEvent(event, this);
    this.focusCell(cell);
  };

  handleFocus = (event) => {
    this.setState({
      hasFocus: true
    });
  };

  handleKeyDown = (event) => {
    const key = event.which || event.keyCode;
    const { column, row } = this.state.focusPointer;

    switch (key) {
      case KeyCodes.LEFT:
        this.focusCell({ column: column - 1, row });
        break;
      case KeyCodes.RIGHT:
        this.focusCell({ column: column + 1, row });
        break;
      case KeyCodes.UP:
        this.focusCell({ column, row: row - 1 });
        break;
      case KeyCodes.DOWN:
        this.focusCell({ column, row: row + 1 });
      default:
        return;
    };

    event.preventDefault();
  };

  render () {
    return (
      <div>
        <h4 id="grid2Label">
          Transactions January 1 through January 7
        </h4>

        <table
          ref={this.bindTableRef}
          role="grid"
          aria-labelledby="grid2Label"
          className={`${styles.Grid} data`}
          onBlur={this.handleBlur}
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
        >
          <tbody>
            <tr>
              <th className={styles.GridHeader} aria-sort="ascending">
                <span tabIndex="-1" role="button">
                  Date
                </span>
              </th>
              <th className={styles.GridHeader} tabIndex="-1">
                Type
              </th>
              <th className={styles.GridHeader} tabIndex="-1">
                Description
              </th>
              <th className={styles.GridHeader} tabIndex="-1">
                Category
              </th>
              <th className={styles.GridHeader} aria-sort="none">
                <span tabIndex="-1" role="button">
                  Amount
                </span>
              </th>
              <th className={styles.GridHeader} tabIndex="-1">
                Balance
              </th>
            </tr>

            {
              data.map((datum, index) => renderRow(datum, index, this))
            }
          </tbody>
        </table>
      </div>
    );
  }
}
