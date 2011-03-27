// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

/** @constructor */
Vex.Flow.Formatter = function(){
  this.minTotalWidth = 0;
  this.minTicks = null;
  this.pixelsPerTick = 0;
  this.totalTicks = 0;
  this.tContexts = null;

  this.render_options = {
    perTickableWidth: 15,
    maxExtraWidthPerTickable: 40
  };
}

// Helper function to format and draw a single voice
Vex.Flow.Formatter.FormatAndDraw = function(ctx, stave, notes, width) {
  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], width);

  voice.draw(ctx, stave);
}

// Helper function to format and draw a single voice
Vex.Flow.Formatter.FormatAndDrawTab = function(ctx,
    tabstave, stave, tabnotes, notes, width) {

  var tabvoice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  tabvoice.addTickables(tabnotes);

  var notevoice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  notevoice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([tabvoice]).
    joinVoices([notevoice]).
    format([tabvoice, notevoice], width);

  tabvoice.draw(ctx, tabstave);
  notevoice.draw(ctx, stave);
}

Vex.Flow.Formatter.prototype.getMinTotalWidth = function() {
  return this.minTotalWidth; }

/**
 * Take a set of voices and place aligned tickables in the same modifier
 * context.
 */
Vex.Flow.Formatter.createContexts = function(voices, context_type, add_fn) {
  if (!voices || !voices.length) throw new Vex.RERR("BadArgument",
      "No voices to format");

  var totalTicks = voices[0].getTotalTicks();
  var tickToContextMap = {};
  var tickList = [];

  for (var i = 0; i < voices.length; ++i) {
    var voice = voices[i];
    if (voice.getTotalTicks() != totalTicks)
      throw new Vex.RERR("TickMismatch",
          "Voices should have same time signature.");

    if (!voice.isComplete()) throw new Vex.RERR("IncompleteVoice",
        "Voice does not have enough notes.");

    var tickables = voice.getTickables();
    var ticksUsed = 0;
    for (var j = 0; j < tickables.length; ++j) {
      var tickable = tickables[j];

      // If we have no tick context for this tick, create one
      if (!tickToContextMap[ticksUsed])
        tickToContextMap[ticksUsed] = new context_type();

      // Add this tickable to the TickContext
      add_fn(tickable, tickToContextMap[ticksUsed]);

      // Maintain a sorted list of tick contexts
      tickList.push(ticksUsed);
      ticksUsed += tickable.getTicks();
    }
  }

  return {
    map: tickToContextMap,
    list: Vex.SortAndUnique(tickList, function(a, b) { return a - b; })
  };
}

Vex.Flow.Formatter.prototype.createModifierContexts = function(voices) {
  var contexts = Vex.Flow.Formatter.createContexts(voices,
      Vex.Flow.ModifierContext,
      function(tickable, context) {
        tickable.addToModifierContext(context);
      });
  return contexts;
}

/**
 * Take a set of voices and place aligned tickables in the same modifier
 * tick context.
 */
Vex.Flow.Formatter.prototype.createTickContexts = function(voices) {
  var contexts = Vex.Flow.Formatter.createContexts(voices,
      Vex.Flow.TickContext,
      function(tickable, context) { context.addTickable(tickable); });

  this.totalTicks = voices[0].getTicksUsed();
  this.tContexts = contexts;
  return contexts;
}

/**
 * Take a set of tick contexts and align thier X-positions and space usage.
 */
Vex.Flow.Formatter.prototype.preFormat = function(justifyWidth) {
  var contexts = this.tContexts;
  var contextList = contexts.list;
  var contextMap = contexts.map;

  this.minTotalWidth = 0;

  // Go through each tick context and calculate total width and smallest
  // ticks.
  for (var i = 0; i < contextList.length; ++i) {
    var context = contextMap[contextList[i]];

    // preFormat() gets them to descend down to their tickables and modifier
    // contexts, and calculate their widths.
    context.preFormat();
    this.minTotalWidth += context.getWidth();

    var minTicks = context.getMinTicks();
    if (i == 0) this.minTicks = minTicks;
    if (minTicks < this.minTicks) this.minTicks = minTicks;
  }

  if (justifyWidth < this.minTotalWidth) throw new Vex.RERR("NoRoomForNotes",
      "Justification width too small to fit all notes: " +
      justifyWidth + " < " + this.minTotalWidth);

  // Figure out how many pixels to allocate per tick.
  var justified = false;
  if (justifyWidth) {
    this.pixelsPerTick = justifyWidth / this.totalTicks;
    justified = true;
  } else {
    this.pixelsPerTick = this.render_options.perTickableWidth / this.minTicks;
  }

  // Now distribute the ticks to each tick context, and assign them their
  // own X positions.
  var x = 0;
  for (var i = 0; i < contextList.length; ++i) {
    var tick = contextList[i];
    var context = contextMap[tick];
    var width = context.getWidth();
    var minTicks = context.getMinTicks();

    var pixels_used = Math.max(width, minTicks * this.pixelsPerTick);
    pixels_used = Math.min(width + 20, pixels_used);

    var set_x = x;

    if (!justified) {
      // Rate limit pixel usage
      var maxWidth = width + this.render_options.maxExtraWidthPerTickable;
      if (pixels_used > maxWidth) pixels_used = maxWidth;
    } else {
      set_x = tick * this.pixelsPerTick;

      // Make way for accidentals, etc. Prefer pushing out over the edge
      // to overlapping over other notes.
      if (set_x < x) set_x += (x - set_x);
    }

    context.setX(set_x);
    context.setPixelsUsed(pixels_used);

    x += pixels_used;
  }
}

Vex.Flow.Formatter.prototype.joinVoices = function(voices) {
  this.createModifierContexts(voices);
  return this;
}

Vex.Flow.Formatter.prototype.format = function(voices, justifyWidth) {
  this.createTickContexts(voices);
  this.preFormat(justifyWidth);
  return this;
}
