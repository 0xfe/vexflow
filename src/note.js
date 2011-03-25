// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.Note = function(duration) {
  if (arguments.length > 0) this.init(duration); }

// Inherits from Vex.Flow.Tickable
Vex.Flow.Note.prototype = new Vex.Flow.Tickable();
Vex.Flow.Note.superclass = Vex.Flow.Tickable.prototype;
Vex.Flow.Note.constructor = Vex.Flow.Note;

Vex.Flow.Note.prototype.init = function(duration) {
  var superclass = Vex.Flow.Note.superclass;
  superclass.init.call(this);

  // Note properties
  this.duration = duration;

  // Sanity check
  if (!this.duration)
    throw new Vex.RuntimeError("BadArguments", "Note must have duration.");

  if (this.positions &&
      (typeof(this.positions) != "object" || !this.positions.length)) {
    throw new Vex.RuntimeError(
      "BadArguments", "Note keys must be array type.");
  }

  this.ticks = Vex.Flow.durationToTicks[this.duration];
  if (!this.ticks) {
    throw new Vex.RuntimeError("BadArguments",
        "Invalid duration string (No ticks found): " + this.duration);
  }


  // Positioning contexts
  this.tickContext = null;    // The current tick context
  this.modifierContext = null;

  // Positioning variables
  this.width = 0;             // Width in pixels calculated after preFormat
  this.extraLeftPx = 0;       // Extra room on left
  this.extraRightPx = 0;      // Extra room on right
  this.x_shift = 0;           // X shift from tick context X
  this.voice = null;          // The voice that this note is in
  this.preFormatted = false;  // Is this note preFormatted?
  this.ys = [];               // list of y coordinates for each note
                              // we need to hold on to these for ties and beams.
  // Drawing
  this.context = null;
  this.stave = null;
}

Vex.Flow.Note.prototype.setYs = function(ys) {
  this.ys = ys; return this; }
Vex.Flow.Note.prototype.getStave = function() { return this.stave; }
Vex.Flow.Note.prototype.setStave = function(stave) {
  this.stave = stave; return this; }
Vex.Flow.Note.prototype.setContext = function(context) {
  this.context = context; return this; }
Vex.Flow.Note.prototype.getTicks = function() { return this.ticks; }
Vex.Flow.Note.prototype.getExtraLeftPx = function() {
  return this.extraLeftPx; }
Vex.Flow.Note.prototype.getExtraRightPx = function() {
  return this.extraRightPx; }
Vex.Flow.Note.prototype.setExtraLeftPx = function(x) {
  this.extraLeftPx = x; return this; }
Vex.Flow.Note.prototype.setExtraRightPx = function(x) {
  this.extraRightPx = x; return this; }

Vex.Flow.Note.prototype.getYs = function() {
  if (this.ys.length == 0) throw new Vex.RERR("NoYValues",
      "No Y-values calculated for this note.");
  return this.ys;
}

Vex.Flow.Note.prototype.getYForTopText = function(text_line) {
  if (!this.stave) throw new Vex.RERR("NoStave",
      "No stave attached to this note.");
  return this.stave.getYForTopText(text_line);
}

Vex.Flow.Note.prototype.getVoice = function() {
  if (!this.voice) throw new Vex.RERR("NoVoice", "Note has no voice.");
  return this.voice;
}

Vex.Flow.Note.prototype.setVoice = function(voice) {
  this.voice = voice;
  this.preFormatted = false;
  return this;
}

Vex.Flow.Note.prototype.getTickContext = function() { return this.tickContext; }
Vex.Flow.Note.prototype.setTickContext = function(tc) {
  this.tickContext = tc;
  this.preFormatted = false;
  return this;
}

Vex.Flow.Note.prototype.getDuration = function() {
  return this.duration;
}

Vex.Flow.Note.prototype.setModifierContext = function(mc) {
  this.modifierContext = mc;
  return this;
}

Vex.Flow.Note.prototype.getWidth = function() {
  if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
      "Can't call GetWidth on an unformatted note.");
  return this.width + this.x_shift +
    (this.modifierContext ?  this.modifierContext.getWidth() : 0);
}

Vex.Flow.Note.prototype.setWidth = function(width) { this.width = width; }

Vex.Flow.Note.prototype.setXShift = function(x) {
  this.x_shift = x;
  return this;
}

Vex.Flow.Note.prototype.getX = function(x) {
  if (!this.tickContext) throw new Vex.RERR("NoTickContext",
      "Note needs a TickContext assigned for an X-Value");
  return this.tickContext.getX() + this.x_shift;
}

Vex.Flow.Note.prototype.getAbsoluteX = function(x) {
  if (!this.tickContext) throw new Vex.RERR("NoTickContext",
      "Note needs a TickContext assigned for an X-Value");

  // Center the note in the tick context
  var x = this.tickContext.getX() +
    (this.tickContext.getPixelsUsed() / 2) +
    (this.extraLeftPx / 2) -
    (this.extraRightPx / 2);

  if (this.modifierContext)
    x += (this.modifierContext.getExtraLeftPx() / 2) -
         (this.modifierContext.getExtraRightPx() / 2);

  if (this.stave) x += this.stave.getNoteStartX();

  return x;
}

Vex.Flow.Note.prototype.setPreFormatted = function(value) {
  this.preFormatted = value;
}
