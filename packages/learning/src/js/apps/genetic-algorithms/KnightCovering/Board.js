import React from 'react';

import ChessBoard from 'js/apps/genetic-algorithms/shared/ChessBoard';

export default class Board extends React.PureComponent {
  render () {
    const board = [];

    for (let row = 0; row < this.props.size; row++) {
      board[row] = [];
      for (let col = 0; col < this.props.size; col++) {
        board[row].push('	');
      }
    }

    const positions = [];

    if (this.props.chromosome) {
      const { genes } = this.props.chromosome;

      for (let i = 0; i < this.props.chromosome.genes.length; i++) {
        positions.push({ row: genes[i].row, col: genes[i].col, piece: '\u265e' });
      }
    }

    return (
      <ChessBoard positions={positions} size={this.props.size} />
    );
  }
}
