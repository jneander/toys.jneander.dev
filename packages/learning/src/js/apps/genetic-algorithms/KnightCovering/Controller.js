import Chromosome from '@jneander/genetics/es/Chromosome';
import { replaceOneGene } from '@jneander/genetics/es/mutation';
import { choice, randomInt, range } from '@jneander/genetics/es/util';

import BaseController from '../shared/Controller';

import BoardCoverage from './BoardCoverage';
import { listAttacks, positionFromHash, positionHash } from './util';

const minimumKnightsByBoardSize = {
  4: 6,
  5: 7,
  6: 8,
  7: 10,
  8: 14,
  9: 18,
  10: 22,
  11: 25,
  12: 28,
  13: 33,
  14: 38,
  15: 45,
  16: 50,
  17: 58,
  18: 62,
  19: 68,
  20: 77
};

function randomPosition (boardSize) {
  return { row: randomInt(0, boardSize), col: randomInt(0, boardSize) };
}

function allPositionsForBoard (boardSize) {
  const positions = [];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

function mutate (parent, iteration) {
  let count = randomInt(0, 10) === 0 ? 2 : 1;
  const genes = [...parent.genes];

  while (count > 0) {
    count--;

    const positionToKnightIndexes = new Map();
    for (let row = 0; row < this._boardSize; row++) {
      for (let col = 0; col < this._boardSize; col++) {
        positionToKnightIndexes.set(positionHash(row, col), []);
      }
    }

    for (let i = 0; i < genes.length; i++) {
      const attacks = listAttacks(genes[i], this._boardSize);
      for (let j = 0; j < attacks.length; j++) {
        const { row, col } = attacks[j];
        positionToKnightIndexes.get(positionHash(row, col)).push(i);
      }
    }

    const knightIndexes = new Set(range(0, genes.length));
    const unattacked = [];

    const positionToKnightIndexArray = Array.from(positionToKnightIndexes);
    for (let i = 0; i < positionToKnightIndexArray.length; i++) {
      const [positionHash, knightIndexesAtPosition] = positionToKnightIndexArray[i];
      if (knightIndexesAtPosition.length > 1) {
        continue;
      }
      if (knightIndexesAtPosition.length === 0) {
        unattacked.push(positionFromHash(positionHash));
        continue;
      }
      for (let j = 0; j < knightIndexesAtPosition.length; j++) {
        knightIndexes.delete(knightIndexesAtPosition[j]);
      }
    }

    let potentialKnightPositions = [];
    if (unattacked.length) {
      for (let i = 0; i < unattacked.length; i++) {
        const positionsWhichCanAttackThisPosition = listAttacks(unattacked[i], this._boardSize);
        potentialKnightPositions = [...potentialKnightPositions, ...positionsWhichCanAttackThisPosition];
      }
    } else {
      potentialKnightPositions = [...this._allBoardPositions];
    }

    let indexOfGeneToReplace;
    if (knightIndexes.length) {
      indexOfGeneToReplace = choice(knightIndexes);
    } else {
      indexOfGeneToReplace = randomInt(0, genes.length);
    }

    genes[indexOfGeneToReplace] = choice(potentialKnightPositions);
  }

  const chromosome = new Chromosome(genes, iteration);
  chromosome.fitness = this.fitnessMethod.getFitness(chromosome);
  return chromosome;
}

export default class Controller extends BaseController {
  constructor (state) {
    super(state);

    this._boardSize = 8;
    this._knightCount = minimumKnightsByBoardSize[this._boardSize];
    this._allBoardPositions = allPositionsForBoard(this._boardSize);
    this.fitnessMethod = new BoardCoverage({ boardSize: this._boardSize });
    this.getInitialState = this.getInitialState.bind(this);
  }

  generateParent () {
    const genes = [];
    while (genes.length < this._knightCount) {
      genes.push(randomPosition(this._boardSize));
    }

    const chromosome = new Chromosome(genes, null);
    chromosome.fitness = this.fitnessMethod.getFitness(chromosome);
    return chromosome;
  }

  geneSet () {
    return range(0, this._boardSize);
  }

  getInitialState () {
    return {
      ...super.getInitialState(),
      boardSize: this._boardSize
    };
  }

  propogationOptions () {
    return {
      mutate: mutate.bind(this)
    }
  }

  randomTarget () {
    const target = new Chromosome([], null);
    target.fitness = this.fitnessMethod.getTargetFitness();
    return target;
  }

  setBoardSize (size) {
    this._boardSize = size;
    this._knightCount = minimumKnightsByBoardSize[this._boardSize];
    this._allBoardPositions = allPositionsForBoard(this._boardSize);
    this.fitnessMethod = new BoardCoverage({ boardSize: this._boardSize });
    this.randomizeTarget();
  }

  state () {
    return {
      boardSize: this._boardSize
    }
  }
}
