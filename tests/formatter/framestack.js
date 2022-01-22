class FrameStack {
  constructor(parentEl, numFrames, params) {
    this.parentEl = parentEl;
    this.numFrames = numFrames;
    this.options = {
      prefix: 'vex-frame-',
      width: 700,
      height: 800,
      iterationCallback: null,
      ...params,
    };

    this.frames = [];
    this.currentFrame = 0;

    document.getElementById(this.parentEl).innerHTML = '';
    for (let i = 0; i < this.numFrames; i++) {
      const div = document.createElement('div');
      div.id = this.frameID(i);
      div.style.position = 'absolute';
      div.style.top = 0;
      div.style.left = 0;
      div.style.width = `${this.options.width}px`;
      div.style.height = `${this.options.height}px`;
      div.style.display = 'none';
      this.frames[i] = div;
    }
  }

  frameID(i) {
    return `${this.options.prefix}${i}`;
  }

  install() {
    this.show(0);

    setTimeout(() => {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < this.numFrames; i++) {
        fragment.appendChild(this.frames[i]);
      }

      const parent = document.getElementById(this.parentEl);
      parent.appendChild(fragment);
      parent.style.width = `${this.options.width}px`;
      parent.style.height = `${this.options.height}px`;
    }, 0);
  }

  get(i) {
    return this.frames[i];
  }

  show(i) {
    this.frames[this.currentFrame].style.display = 'none';
    this.frames[i].style.display = 'block';
    this.currentFrame = i;
  }

  start(params) {
    const options = {
      start: 0,
      end: this.numFrames,
      intervalms: 100,
      ...params,
    };

    this.animationTimer = setInterval(() => {
      const frame = this.currentFrame + 1 === this.numFrames ? 0 : this.currentFrame + 1;
      this.show(frame);
      if (this.options.iterationCallback) this.options.iterationCallback(frame);
    }, options.intervalms);
  }

  stop() {
    clearInterval(this.animationTimer);
  }
}

if (typeof module != 'undefined') {
  module.exports = { FrameStack };
}
