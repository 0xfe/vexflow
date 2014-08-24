/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TIME4_4 = {
  num_beats: 4,
  beat_value: 4,
  resolution: Vex.Flow.RESOLUTION
};

/* Mock Tickable */

Vex.Flow.Test.MockTickable = function() { this.ignore_ticks = false; }
Vex.Flow.Test.MockTickable.prototype.getX = function() {
  return this.tickContext.getX();}
Vex.Flow.Test.MockTickable.prototype.getIntrinsicTicks = function() {return this.ticks;}
Vex.Flow.Test.MockTickable.prototype.getTicks = function() {return this.ticks;}
Vex.Flow.Test.MockTickable.prototype.setTicks = function(t) {
  this.ticks = new Vex.Flow.Fraction(t, 1); return this; };
Vex.Flow.Test.MockTickable.prototype.getMetrics = function() {
  return { noteWidth: this.width,
           left_shift: 0,
           modLeftPx: 0, modRightPx: 0,
           extraLeftPx: 0, extraRightPx: 0 };
}
Vex.Flow.Test.MockTickable.prototype.getWidth = function() {return this.width;}
Vex.Flow.Test.MockTickable.prototype.setWidth = function(w) {
  this.width = w; return this; }
Vex.Flow.Test.MockTickable.prototype.setVoice = function(v) {
  this.voice = v; return this; }
Vex.Flow.Test.MockTickable.prototype.setStave = function(stave) {
  this.stave = stave; return this; }
Vex.Flow.Test.MockTickable.prototype.setTickContext = function(tc) {
  this.tickContext = tc; return this; }
Vex.Flow.Test.MockTickable.prototype.setIgnoreTicks = function(ignore_ticks) {
  this.ignore_ticks = ignore_ticks; return this; }
Vex.Flow.Test.MockTickable.prototype.shouldIgnoreTicks = function() {
  return this.ignore_ticks; }
Vex.Flow.Test.MockTickable.prototype.preFormat = function() {}