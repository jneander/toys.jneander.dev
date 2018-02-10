import Fitness from '@jneander/genetics/es/fitness/Fitness';

function positionKey (row, column) {
  return `${row},${column}`;
}

function hashGenes (genes) {
  const hash = {};
  for (let i = 0; i < genes.length; i += 2) {
    hash[positionKey(genes[i], genes[i + 1])] = true;
  }
  return hash;
}

export default class FewestAttacks {
  constructor (config) {
    this.config = config;
  }

  getFitness (current) {
    const geneHash = hashGenes(current.genes);

    const rowsWithQueens = new Set();
    const colsWithQueens = new Set();
    const northEastDiagonalsWithQueens = new Set();
    const southEastDiagonalsWithQueens = new Set();

    for (let row = 0; row < this.config.boardSize; row++) {
      for (let col = 0; col < this.config.boardSize; col++) {
        if (geneHash[positionKey(row, col)]) {
          rowsWithQueens.add(row);
          colsWithQueens.add(col);
          northEastDiagonalsWithQueens.add(row + col);
          southEastDiagonalsWithQueens.add(this.config.boardSize - 1 - row + col);
        }
      }
    }

    const fitness = (
      this.config.boardSize - rowsWithQueens.size +
      this.config.boardSize - colsWithQueens.size +
      this.config.boardSize - northEastDiagonalsWithQueens.size +
      this.config.boardSize - southEastDiagonalsWithQueens.size
    );

    return new Fitness(fitness, false);
  }

  getTargetFitness () {
    return new Fitness(0, false);
  }
}
