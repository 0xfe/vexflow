// Vex Flow
// Copyright Mohit Cheppudira <mohit@muthanna.com>
//
// The tickable interface. Tickables are things that sit on a score and
// have a duration, i.e., they occupy space in the musical rendering dimension.

/** @constructor */
Vex.Flow.Tickable = function() {
  this.init();
}

Vex.Flow.Tickable.prototype.init = function() {
  this.intrinsicTicks = 0;
  this.tickMultiplier = new Vex.Flow.Fraction(1, 1);
  this.ticks = new Vex.Flow.Fraction(0, 1);
  this.width = 0;
  this.x_shift = 0; // Shift from tick context
  this.voice = null;
  this.tickContext = null;
  this.modifierContext = null;
  this.modifiers = [];
  this.preFormatted = false;
  this.tuplet = null;

  // This flag tells the formatter to ignore this tickable during
  // formatting and justification. It is set by tickables such as BarNote.
  this.ignore_ticks = false;
  this.context = null;
}

Vex.Flow.Tickable.prototype.setContext = function(context) {
  this.context = context;
}

Vex.Flow.Tickable.prototype.getTuplet = function() {
  return this.tuplet;
}

Vex.Flow.Tickable.prototype.setTuplet = function(tuplet) {
  // Detach from previous tuplet
  if (this.tuplet) {
    var noteCount = this.tuplet.getNoteCount();
    var beatsOccupied = this.tuplet.getBeatsOccupied();

    // Revert old multiplier
    this.applyTickMultiplier(noteCount, beatsOccupied);
  }

  // Attach to new tuplet
  if (tuplet) {
    var noteCount = tuplet.getNoteCount();
    var beatsOccupied = tuplet.getBeatsOccupied();

    this.applyTickMultiplier(beatsOccupied, noteCount);
  }

  this.tuplet = tuplet;

  return this;
}

/** optional, if tickable has modifiers **/
Vex.Flow.Tickable.prototype.addToModifierContext = function(mc) {
  this.modifierContext = mc;
  // Add modifiers to modifier context (if any)
  this.preFormatted = false;
}

/** optional, if tickable has modifiers **/
Vex.Flow.Tickable.prototype.addModifier = function(mod) {
  this.modifiers.push(mod);
  this.preFormatted = false;
  return this;
}

Vex.Flow.Tickable.prototype.setTickContext = function(tc) {
  this.tickContext = tc;
  this.preFormatted = false;
}

Vex.Flow.Tickable.prototype.preFormat = function() {
  if (preFormatted) return;

  this.width = 0;
  if (this.modifierContext) {
    this.modifierContext.preFormat();
    this.width += this.modifierContext.getWidth();
  }

  // Calculate any extra width required.
}

Vex.Flow.Tickable.prototype.getBoundingBox = function() {
  return null;
}

Vex.Flow.Tickable.prototype.getIntrinsicTicks = function() {
  return this.intrinsicTicks;
}
Vex.Flow.Tickable.prototype.setIntrinsicTicks = function(intrinsicTicks) {
  this.intrinsicTicks = intrinsicTicks;
  this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
}

Vex.Flow.Tickable.prototype.getTickMultiplier = function() {
  return this.tickMultiplier;
}
Vex.Flow.Tickable.prototype.applyTickMultiplier = function(numerator, denominator) {
  this.tickMultiplier.multiply(numerator, denominator);
  this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
}

// Formatters and preformatters use ticks and width to calculate the position
// of these tickables.
Vex.Flow.Tickable.prototype.getTicks = function() {
  return this.ticks;
}
Vex.Flow.Tickable.prototype.shouldIgnoreTicks = function() {
  return this.ignore_ticks;
}

Vex.Flow.Tickable.prototype.getWidth = function() { return this.width; }

// Formatters will set the X value of the tickable.
Vex.Flow.Tickable.prototype.setXShift = function(x) { this.x_shift = x; }

// Every tickable must be associated with a voice. This allows formatters
// and preFormatter to associate them with the right modifierContexts.
Vex.Flow.Tickable.prototype.getVoice = function() {
  if (!this.voice) throw new Vex.RERR("NoVoice", "Tickable has no voice.");
  return this.voice;
}
Vex.Flow.Tickable.prototype.setVoice = function(voice) { this.voice = voice; }

