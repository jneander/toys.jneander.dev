function timeForAnotherLoop (startTime, iterations) {
  const difference = Math.floor(Date.now()) - startTime;
  const average = difference / iterations;
  return difference + average < 15;
}

function boundedLoop (loopFn) {
  const startTime = Math.floor(Date.now());
  const iterations = 1;
  while (this.interval != null && timeForAnotherLoop(startTime, iterations)) {
    loopFn();
  }
}

function iterate () {
  const loopFn = () => {
    this.iterationCount++;
    const child = this.config.mutate(this.bestParent, this.iterationCount);
    this.config.onIteration(child);

    this.currentGuess = child;
    if (this.bestParent.fitness.isGreaterThan(child.fitness)) {
      // this child is worse than the previous iteration; skip it
      return;
    }

    if (!child.fitness.isGreaterThan(this.bestParent.fitness)) {
      // this child is not "better" than the parent
      // use it anyway, in case it helps progress
      this.bestParent = child;
      return;
    }

    this.bestParent = child;
    this.config.onImprovement(this.bestParent);

    if (!child.fitness.isLessThan(this.config.optimalFitness)) {
      this.stop();
      this.config.onFinish();
    }
  };

  return setInterval(() => {
    boundedLoop.call(this, loopFn);
  }, 0);
}

export default class Propagation {
  constructor (config) {
    this.config = config;

    this.iterationCount = 0;
    this.interval = null;
  }

  best () {
    return this.bestParent;
  }

  current () {
    return this.currentGuess;
  }

  run () {
    if (this.interval != null) {
      return;
    }

    this.config.onRun();

    if (!this.iterationCount) {
      this.iterationCount++;
      this.bestParent = this.config.generateParent();
      this.config.onIteration(this.bestParent);

      this.config.onImprovement(this.bestParent);
      this.currentGuess = this.bestParent;

      if (!this.bestParent.fitness.isLessThan(this.config.optimalFitness)) {
        this.config.onFinish();
        return;
      }
    }

    this.interval = iterate.call(this);
  }

  stop () {
    if (this.interval != null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
