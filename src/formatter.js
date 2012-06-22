// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

/** @constructor */
Vex.Flow.Formatter = function(){
  this.minTotalWidth = 0;
  this.minTicks = null;
  this.pixelsPerTick = 0;
  this.totalTicks = new Vex.Flow.Fraction(0, 1);
  this.tContexts = null;
  this.mContexts = null;

  this.render_options = {
    perTickableWidth: 15,
    maxExtraWidthPerTickable: 40
  };
}

// Helper function to format and draw a single voice
Vex.Flow.Formatter.FormatAndDraw = function(ctx, stave, notes) {
  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);

  voice.draw(ctx, stave);
}

// Helper function to format and draw a single voice
Vex.Flow.Formatter.FormatAndDrawTab = function(ctx,
    tabstave, stave, tabnotes, notes) {

  var notevoice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  notevoice.addTickables(notes);

  var tabvoice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  tabvoice.addTickables(tabnotes);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([notevoice]).
    joinVoices([tabvoice]).
    formatToStave([notevoice,tabvoice], stave);

  notevoice.draw(ctx, stave);
  tabvoice.draw(ctx, tabstave);

  // Draw a connector between tab and note staves.
  (new Vex.Flow.StaveConnector(stave, tabstave)).setContext(ctx).draw();
}

/**
 * Take a set of voices and place aligned tickables in the same modifier
 * context.
 */
Vex.Flow.Formatter.createContexts = function(voices, context_type, add_fn) {
  if (!voices || !voices.length) {
    throw new Vex.RERR("BadArgument", "No voices to format");
  }

  var totalTicks = voices[0].getTotalTicks();
  var tickToContextMap = {};
  var tickList = [];

  var resolutionMultiplier = 1;

  // Find out highest common multiple of resolution multipliers.
  // The purpose of this is to find out a common denominator
  // for all fractional tick values in all tickables of all voices,
  // so that the values can be expanded and the numerator used
  // as an integer tick value.
  for (var i = 0; i < voices.length; ++i) {
    var voice = voices[i];
    if (voice.getTotalTicks().value() != totalTicks.value()) {
      throw new Vex.RERR("TickMismatch",
          "Voices should have same time signature.");
    }

    if (!voice.isComplete()) {
      throw new Vex.RERR("IncompleteVoice",
        "Voice does not have enough notes.");
    }

    var lcm = Vex.LCM(resolutionMultiplier, voice.getResolutionMultiplier());
    if (resolutionMultiplier < lcm) {
      resolutionMultiplier = lcm;
    }
  }

  for (var i = 0; i < voices.length; ++i) {
    var voice = voices[i];

    var tickables = voice.getTickables();

    // Use resolution multiplier as denominator to expand ticks
    // to suitable integer values, so that no additional expansion
    // of fractional tick values is needed.
    var ticksUsed = new Vex.Flow.Fraction(0, resolutionMultiplier);

    for (var j = 0; j < tickables.length; ++j) {
      var tickable = tickables[j];

      var integerTicks = ticksUsed.numerator;

      // If we have no tick context for this tick, create one
      if (!tickToContextMap[integerTicks])
        tickToContextMap[integerTicks] = new context_type();

      // Add this tickable to the TickContext
      add_fn(tickable, tickToContextMap[integerTicks]);

      // Maintain a sorted list of tick contexts
      tickList.push(integerTicks);

      ticksUsed.add(tickable.getTicks());
    }
  }

  return {
    map: tickToContextMap,
    list: Vex.SortAndUnique(tickList, function(a, b) { return a - b; },
        function(a, b) { return a === b; } ),
    resolutionMultiplier: resolutionMultiplier
  };
}

Vex.Flow.Formatter.prototype.getMinTotalWidth = function() {
  return this.minTotalWidth;
}

Vex.Flow.Formatter.prototype.createModifierContexts = function(voices) {
  var contexts = Vex.Flow.Formatter.createContexts(voices,
      Vex.Flow.ModifierContext,
      function(tickable, context) {
        tickable.addToModifierContext(context);
      });
  this.mContexts = contexts;
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

  this.totalTicks = voices[0].getTicksUsed().clone();
  this.tContexts = contexts;
  return contexts;
}

/**
 * Take a set of tick contexts and align their X-positions and space usage.
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
    if (minTicks.value() < this.minTicks.value()) {
      this.minTicks = minTicks;
    }
  }

  if (justifyWidth < this.minTotalWidth) {
    throw new Vex.RERR("NoRoomForNotes",
      "Justification width too small to fit all notes: " +
      justifyWidth + " < " + this.minTotalWidth);
  }

  // Figure out how many pixels to allocate per tick.
  var justified = false;
  if (justifyWidth) {
    this.pixelsPerTick = justifyWidth /
      (this.totalTicks.value() * contexts.resolutionMultiplier);
    justified = true;
  } else {
    this.pixelsPerTick = this.render_options.perTickableWidth /
      (this.minTicks.value() * contexts.resolutionMultiplier);
  }

  // Now distribute the ticks to each tick context, and assign them their
  // own X positions.
  var x = 0;
  var white_space = 0; // White space to right of previous note
  var tick_space = 0;  // Pixels from prev note x-pos to curent note x-pos
  var prev_tick = 0;
  var prev_width = 0;
  var lastMetrics = null;

  for (var i = 0; i < contextList.length; ++i) {
    var tick = contextList[i];
    var context = contextMap[tick];
    var thisMetrics = context.getMetrics();
    var width = context.getWidth();
    var minTicks = context.getMinTicks().value();
    var min_x = 0;

    // TODO: Try modifying (minTicks * this.pixelsPerTick) to adjust spacing
    var pixels_used = Math.max(width, minTicks * this.pixelsPerTick);
    pixels_used = Math.min(width + 20, pixels_used);

    // Pixels to next note x position
    tick_space = (tick - prev_tick) * this.pixelsPerTick;

    // Calculate note x position
    var new_set_x = x + tick_space;
    var set_x = new_set_x;

    // Calculate the minimum next note position to allow for right modifiers
    if (lastMetrics != null)
      min_x = x + prev_width - lastMetrics.extraLeftPx;

    // Determine the space required for the previous tick
    set_x = Math.max(set_x, min_x);

    // Determine pixels needed for left modifiers
    var left_px = thisMetrics.extraLeftPx;

    // Determine white space to right of previous tick
    if (lastMetrics != null) {
      white_space = (set_x - x) - (prev_width -
                                   lastMetrics.extraLeftPx);
    }
    if (i > 0) {
      if (white_space > 0) {
        if (white_space >= left_px) {
          // Have enough white space for left modifiers - no offset needed
          left_px = 0;
        } else {
          // Decrease left modifier offset by amount of white space
          left_px -= white_space;
        }
      }
    }

    // Adjust the tick x position with the left modifier offset
    set_x += left_px;

    context.setX(set_x);
    context.setPixelsUsed(pixels_used);  // ??? Not sure this is neeeded
    lastMetrics = thisMetrics;
    prev_width = width;
    prev_tick = tick;
    x = set_x;
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

Vex.Flow.Formatter.prototype.formatToStave = function(voices, stave) {
  var voice_width = (stave.getNoteEndX() - stave.getNoteStartX()) - 20;
  this.createTickContexts(voices);
  this.preFormat(voice_width);
  return this;
}

