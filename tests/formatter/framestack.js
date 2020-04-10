class FrameStack {
  constructor(parentEl, numFrames, params) {
    this.parentEl = parentEl;
    this.numFrames = numFrames;
    this.options = {
      prefix: 'vex-frame-',
      ...params
    };

    this.frames = [];
    this.currentFrame = 0;
    this.install();
  }

  frameID(i) {
    return `${this.options.prefix}${i}`;
  }

  install() {
    document.getElementById(this.parentEl).innerHTML = '';
    for (let i = 0; i < this.numFrames; i++) {
      const div = document.createElement('div');
      div.id = this.frameID(i);
      div.style.position = 'absolute';
      div.style.top = 0;
      div.style.left = 0;
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.display = 'none';
      div.innerHTML = `<h2>Iteration ${i}</h2>`;

      document.getElementById(this.parentEl).appendChild(div);
      this.frames[i] = div;
    }
  }

  get(i) {
    return this.frames[i];
  }

  show(i) {
    document.getElementById(this.frameID(this.currentFrame)).style.display = 'none';
    document.getElementById(this.frameID(i)).style.display = 'block';
    this.currentFrame = i;
  }

  startAnimation(params) {
    const options = {
      start: 0,
      end: this.numFrames,
      intervalms: 100,
      ...params,
    };

    this.animationTimer = setInterval(() => {
      const frame = (this.currentFrame + 1) === this.numFrames ? 0 : this.currentFrame + 1;
      this.show(frame);
    }, options.intervalms);
  }
}

module.exports = { FrameStack };
