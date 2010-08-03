// Vex Flow
// Copyright Mohit Cheppudira <mohit@muthanna.com>
//
// A formatter for abstract tickable objects, such as notes, chords,
// tabs, etc.

/** @constructor */
Vex.Flow.TickContext = function() {
  this.init();
}

Vex.Flow.TickContext.prototype.init = function() {
  this.currentTick = 0;
  this.maxTicks = 0;
  this.minTicks = null;
  this.width = 0;
  this.padding = 3;     // padding on each side (width += padding * 2)
  this.pixelsUsed = 0;
  this.x = 0;
  this.tickables = []; // Notes, tabs, chords, lyrics.

  // Ignore this tick context for formatting and justification
  this.ignore_ticks = true;
  this.preFormatted = false;
}

Vex.Flow.TickContext.prototype.setCurrentTick = function(tick) {
  this.currentTick = tick;
  this.preFormatted = false;
}

Vex.Flow.TickContext.prototype.getCurrentTick = function() {
  return this.currentTick;
}

Vex.Flow.TickContext.prototype.shouldIgnoreTicks = function() {
  return this.ignore_ticks;
}

Vex.Flow.TickContext.prototype.getWidth = function() {
  return this.width + (this.padding * 2);
}

Vex.Flow.TickContext.prototype.getX = function() {
  return this.x;
}

Vex.Flow.TickContext.prototype.setX = function(x) {
  this.x = x;
  return this;
}

Vex.Flow.TickContext.prototype.getPixelsUsed = function() {
  return this.pixelsUsed;
}

Vex.Flow.TickContext.prototype.setPixelsUsed = function(pixelsUsed) {
  this.pixelsUsed = pixelsUsed;
  return this;
}

Vex.Flow.TickContext.prototype.setPadding = function(padding) {
  this.padding = padding;
  return this;
}

Vex.Flow.TickContext.prototype.getMaxTicks = function() {
  return this.maxTicks;
}

Vex.Flow.TickContext.prototype.getMinTicks = function() {
  return this.minTicks;
}

Vex.Flow.TickContext.prototype.getTickables = function() {
  return this.tickables;
}

Vex.Flow.TickContext.prototype.addTickable = function(tickable) {
  if (!tickable) throw new Vex.RERR("BadArgument", "Invalid tickable added.");

  var ticks = tickable.getTicks();

  if (!tickable.shouldIgnoreTicks()) {
    this.ignore_ticks = false;
    if (ticks > this.maxTicks) this.maxTicks = ticks;
    if (this.minTicks == null) this.minTicks = ticks;
    if (ticks < this.minTicks) this.minTicks = ticks;
  }

  tickable.setTickContext(this);
  this.tickables.push(tickable);
  this.preFormatted = false;
  return this;
}

Vex.Flow.TickContext.prototype.preFormat = function() {
  if (this.preFormatted) return;

  for (var i = 0; i < this.tickables.length; ++i) {
    var tickable = this.tickables[i];
    tickable.preFormat();
    var width = tickable.getWidth();
    if (width > this.width) this.width = width;
  }

  return this;
}
