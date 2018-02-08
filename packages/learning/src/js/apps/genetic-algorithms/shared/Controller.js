import ControlledPropagation from '../shared/ControlledPropagation';
import PropagationListener from '../shared/PropagationListener';
import PropagationRecording from '../shared/PropagationRecording';

export default class Controller {
  constructor (state) {
    this._state = state;

    this.listener = new PropagationListener(this.updateView.bind(this));
    this.recording = new PropagationRecording();

    this.getFitness = this.getFitness.bind(this);
    this.randomizeTarget = this.randomizeTarget.bind(this);
    this.setPlaybackPosition = this.setPlaybackPosition.bind(this);
    this.setRecordAllIterations = this.setRecordAllIterations.bind(this);
    this.state = this.state.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  getInitialState () {
    return {
      allIterations: false,
      isRunning: false,
      iterationCount: 0,
      playbackPosition: 1,
    };
  }

  initialize () {
    this.randomizeTarget();
    this.createPropagation();
  }

  createPropagation () {
    this.propagation = new ControlledPropagation({
      generateParent: this.generateParent.bind(this),
      geneSet: this.geneSet(),
      getFitness: this.getFitness,
      onFinish: this.onFinish.bind(this),
      onImprovement: (chromosome) => {
        this.recording.addImprovement(chromosome);
      },
      onIteration: (chromosome) => {
        this.recording.addIteration(chromosome);
      },
      optimalFitness: this.target().fitness,
      ...this.propogationOptions()
    });
  }

  getFitness (chromosome) {
    return this.fitnessMethod.getFitness(chromosome, this.target());
  }

  onFinish () {
    this.listener.stop();
    this.updateView();
  }

  randomizeTarget () {
    this.setTarget(this.randomTarget());
  }

  setPlaybackPosition (playbackPosition) {
    this.recording.setPlaybackPosition(playbackPosition);
    this.updateView();
  }

  setTarget (target) {
    this._target = target;
    this.createPropagation();
    this.recording.reset();
    this.updateView();
  }

  setRecordAllIterations (allIterations) {
    this.createPropagation();
    this.recording.configure({ allIterations });
    this.recording.reset();
    this.updateView();
  }

  start () {
    if (this.propagation.isRunning()) {
      return;
    }

    if (this.propagation.isFinished()) {
      this.createPropagation();
      this.recording.reset();
      this.updateView();
    }

    this.listener.start();
    this.propagation.start();
  }

  state () {
    return {};
  }

  stop () {
    this.propagation.stop();
    this.listener.stop();
    this.updateView();
  }

  target () {
    return this._target;
  }

  updateView () {
    this._state.setState({
      allIterations: this.recording.isRecordingAllIterations(),
      best: this.recording.best(),
      current: this.recording.current(),
      first: this.recording.first(),
      isRunning: !!this.propagation && this.propagation.isRunning(),
      iterationCount: !!this.propagation && this.propagation.iterationCount(),
      playbackPosition: this.recording.playbackPosition(),
      target: this.target(),
      ...this.state()
    });
  }
}
