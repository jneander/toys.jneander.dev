export default class Chromosome {
  constructor (genes, iteration) {
    this.genes = genes;
    this.iteration = iteration;
  }

  set fitness (fitness) {
    this._fitness = fitness;
  }

  get fitness () {
    return this._fitness;
  }

  getGene (index) {
    return this.genes[index];
  }

  getLength () {
    return this.genes.length;
  }

  toString () {
    return this.genes.join('');
  }

  toArray () {
    return this.genes;
  }
}
