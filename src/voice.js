// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

/** @constructor */
Vex.Flow.Voice = (function() {
  function Voice(time) {
    if (arguments.length > 0) this.init(time);
  }

  // Modes allow the addition of ticks in three different ways:
  //
  // STRICT: This is the default. Ticks must fill the voice.
  // SOFT:   Ticks can be added without restrictions.
  // FULL:   Ticks do not need to fill the voice, but can't exceed the maximum
  //         tick length.
  Voice.Mode = {
    STRICT: 1,
    SOFT:   2,
    FULL:   3
  };

  Voice.prototype = {
    init: function(time) {
      this.time = time;

      // Recalculate total ticks.
      this.totalTicks = new Vex.Flow.Fraction(
        this.time.num_beats * (this.time.resolution / this.time.beat_value), 1);

      this.resolutionMultiplier = 1;

      // Set defaults
      this.tickables = [];
      this.ticksUsed = new Vex.Flow.Fraction(0, 1);
      this.smallestTickCount = this.totalTicks.clone();
      this.largestTickWidth = 0;
      this.stave = null;
      this.boundingBox = null;
      // Do we care about strictly timed notes
      this.mode = Vex.Flow.Voice.Mode.STRICT;

      // This must belong to a VoiceGroup
      this.voiceGroup = null;
    },

    getTotalTicks: function() { return this.totalTicks; },
    getTicksUsed: function() { return this.ticksUsed; },
    getLargestTickWidth: function() { return this.largestTickWidth; },
    getSmallestTickCount: function() { return this.smallestTickCount; },
    getTickables: function() { return this.tickables; },
    getMode: function() { return this.mode; },
    setMode: function(mode) { this.mode = mode; return this; },
    getResolutionMultiplier: function() { return this.resolutionMultiplier; },
    getActualResolution: function() { return this.resolutionMultiplier * this.time.resolution; },

    setStave: function(stave) {
      this.stave = stave;
      this.boundingBox = null; // Reset bounding box so we can reformat
      return this;
    },

    getBoundingBox: function() {
      if (!this.boundingBox) {
        if (!this.stave) throw Vex.RERR("NoStave", "Can't get bounding box without stave.");
        var stave = this.stave;

        var boundingBox = null;
        if (this.tickables[0]) {
          this.tickables[0].setStave(stave);
          boundingBox = this.tickables[0].getBoundingBox();
        }

        for (var i = 0; i < this.tickables.length; ++i) {
          this.tickables[i].setStave(stave);
          if (i > 0 && boundingBox) {
            var bb = this.tickables[i].getBoundingBox();
            if (bb) boundingBox.mergeWith(bb);
          }
        }

        this.boundingBox = boundingBox;
      }
      return this.boundingBox;
    },

    // Every tickable must be associated with a voiceGroup. This allows formatters
    // and preformatters to associate them with the right modifierContexts.
    getVoiceGroup: function() {
      if (!this.voiceGroup)
        throw new Vex.RERR("NoVoiceGroup", "No voice group for voice.");
      return this.voiceGroup;
    },
    setVoiceGroup: function(g) { this.voiceGroup = g; return this; },

    setStrict: function(strict) {
      this.mode = strict ? Vex.Flow.Voice.Mode.STRICT : Vex.Flow.Voice.Mode.SOFT;
      return this;
    },

    isComplete: function() {
      if (this.mode == Vex.Flow.Voice.Mode.STRICT ||
          this.mode == Vex.Flow.Voice.Mode.FULL) {
        return this.ticksUsed.equals(this.totalTicks);
      } else {
        return true;
      }
    },

    addTickable: function(tickable) {
      if (!tickable.shouldIgnoreTicks()) {
        var ticks = tickable.getTicks();

        // Update the total ticks for this line
        this.ticksUsed.add(ticks);

        if ((this.mode == Vex.Flow.Voice.Mode.STRICT ||
             this.mode == Vex.Flow.Voice.Mode.FULL) &&
             this.ticksUsed.value() > this.totalTicks.value()) {
          this.totalTicks.subtract(ticks);
          throw new Vex.RERR("BadArgument", "Too many ticks.");
        }

        // Track the smallest tickable for formatting
        if (ticks.value() < this.smallestTickCount.value()) {
          this.smallestTickCount = ticks.clone();
        }

        this.resolutionMultiplier = this.ticksUsed.denominator;

        // Expand total ticks using denominator from ticks used
        this.totalTicks.add(0, this.ticksUsed.denominator);
      }

      // Add the tickable to the line
      this.tickables.push(tickable);
      tickable.setVoice(this);
      return this;
    },

    addTickables: function(tickables) {
      for (var i = 0; i < tickables.length; ++i) {
        this.addTickable(tickables[i]);
      }

      return this;
    },

    draw: function(context, stave) {
      var boundingBox = null;
      if (this.tickables[0]) {
        this.tickables[0].setStave(stave);
        boundingBox = this.tickables[0].getBoundingBox();
      }

      for (var i = 0; i < this.tickables.length; ++i) {
        this.tickables[i].setStave(stave);
        if (i > 0 && boundingBox) {
          var tickable_bb = this.tickables[i].getBoundingBox();
          if (tickable_bb) boundingBox.mergeWith(tickable_bb);
        }
        this.tickables[i].setContext(context);
        this.tickables[i].setStave(stave);
        this.tickables[i].draw();
      }

      this.boundingBox = boundingBox;
    }
  };

  return Voice;
}());