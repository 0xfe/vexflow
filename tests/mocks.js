/**
 * VexFlow - TickContext Mocks
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/* Mock Tickable */
VF.Test.MockTickable = (function () {
  function MockTickable() {
    this.ignore_ticks = false;
  }
  MockTickable.prototype = {
    init: function () {},
    getX: function () {
      return this.tickContext.getX();
    },
    getIntrinsicTicks: function () {
      return this.ticks;
    },
    getTicks: function () {
      return this.ticks;
    },
    setTicks: function (t) {
      this.ticks = new VF.Fraction(t, 1);
      return this;
    },
    getMetrics: function () {
      return {
        width: 0,
        glyphWidth: 0,
        notePx: this.width,
        left_shift: 0,
        modLeftPx: 0,
        modRightPx: 0,
        leftDisplacedHeadPx: 0,
        rightDisplacedHeadPx: 0,
      };
    },
    getWidth: function () {
      return this.width;
    },
    setWidth: function (w) {
      this.width = w;
      return this;
    },
    setVoice: function (v) {
      this.voice = v;
      return this;
    },
    setStave: function (stave) {
      this.stave = stave;
      return this;
    },
    setTickContext: function (tc) {
      this.tickContext = tc;
      return this;
    },
    setIgnoreTicks: function (ignore_ticks) {
      this.ignore_ticks = ignore_ticks;
      return this;
    },
    shouldIgnoreTicks: function () {
      return this.ignore_ticks;
    },
    preFormat: function () {},
  };

  return MockTickable;
})();
