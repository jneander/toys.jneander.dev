import React from 'react';

import styles from './styles.css';

function renderSpace (space, spaceIndex, rowIndex) {
  const color = (rowIndex + spaceIndex) % 2 === 0 ? styles.Space__white : styles.Space__black;
  const classNames = `${styles.Space} ${color}`;

  return (
    <td key={spaceIndex} className={classNames}>{ space }</td>
  );
}

function renderRow (row, rowIndex) {
  return (
    <tr key={rowIndex} className={styles.Row}>
      { row.map((space, spaceIndex) => renderSpace(space, spaceIndex, rowIndex)) }
    </tr>
  );
}

export default class Board extends React.PureComponent {
  render () {
    const board = [];

    for (let row = 0; row < this.props.size; row++) {
      board[row] = [];
      for (let col = 0; col < this.props.size; col++) {
        board[row].push('	');
      }
    }

    if (this.props.chromosome) {
      const { genes } = this.props.chromosome;

      for (let i = 0; i < this.props.chromosome.genes.length; i += 2) {
        board[genes[i]][genes[i + 1]] = '♛';
      }
    }

    return (
      <table className={styles.Board}>
        <tbody>
          { board.map(renderRow) }
        </tbody>
      </table>
    );
  }
}
