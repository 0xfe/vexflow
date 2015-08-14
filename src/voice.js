// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the main Voice class. It's mainly a container
// object to group `Tickables` for formatting.
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

  // ## Prototype Methods
  Voice.prototype = {
    init: function(time) {
      this.time = Vex.Merge({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
      }, time);

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

    // Get the total ticks in the voice
    getTotalTicks: function() { return this.totalTicks; },

    // Get the total ticks used in the voice by all the tickables
    getTicksUsed: function() { return this.ticksUsed; },

    // Get the largest width of all the tickables
    getLargestTickWidth: function() { return this.largestTickWidth; },

    // Get the tick count for the shortest tickable
    getSmallestTickCount: function() { return this.smallestTickCount; },

    // Get the tickables in the voice
    getTickables: function() { return this.tickables; },

    // Get/set the voice mode, use a value from `Voice.Mode`
    getMode: function() { return this.mode; },
    setMode: function(mode) { this.mode = mode; return this; },

    // Get the resolution multiplier for the voice
    getResolutionMultiplier: function() { return this.resolutionMultiplier; },

    // Get the actual tick resolution for the voice
    getActualResolution: function() { return this.resolutionMultiplier * this.time.resolution; },

    // Set the voice's stave
    setStave: function(stave) {
      this.stave = stave;
      this.boundingBox = null; // Reset bounding box so we can reformat
      return this;
    },

    // Get the bounding box for the voice
    getBoundingBox: function() {
      var stave, boundingBox, bb, i;

      if (!this.boundingBox) {
        if (!this.stave) throw Vex.RERR("NoStave", "Can't get bounding box without stave.");
        stave = this.stave;
        boundingBox = null;

        for (i = 0; i < this.tickables.length; ++i) {
          this.tickables[i].setStave(stave);

          bb = this.tickables[i].getBoundingBox();
          if (!bb) continue;

          boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
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

    // Set the voice group
    setVoiceGroup: function(g) { this.voiceGroup = g; return this; },

    // Set the voice mode to strict or soft 
    setStrict: function(strict) {
      this.mode = strict ? Vex.Flow.Voice.Mode.STRICT : Vex.Flow.Voice.Mode.SOFT;
      return this;
    },

    // Determine if the voice is complete according to the voice mode
    isComplete: function() {
      if (this.mode == Vex.Flow.Voice.Mode.STRICT ||
          this.mode == Vex.Flow.Voice.Mode.FULL) {
        return this.ticksUsed.equals(this.totalTicks);
      } else {
        return true;
      }
    },

    // Add a tickable to the voice
    addTickable: function(tickable) {
      if (!tickable.shouldIgnoreTicks()) {
        var ticks = tickable.getTicks();

        // Update the total ticks for this line.
        this.ticksUsed.add(ticks);

        if ((this.mode == Vex.Flow.Voice.Mode.STRICT ||
             this.mode == Vex.Flow.Voice.Mode.FULL) &&
             this.ticksUsed.greaterThan(this.totalTicks)) {
          this.totalTicks.subtract(ticks);
          throw new Vex.RERR("BadArgument", "Too many ticks.");
        }

        // Track the smallest tickable for formatting.
        if (ticks.lessThan(this.smallestTickCount)) {
          this.smallestTickCount = ticks.clone();
        }

        this.resolutionMultiplier = this.ticksUsed.denominator;

        // Expand total ticks using denominator from ticks used.
        this.totalTicks.add(0, this.ticksUsed.denominator);
      }

      // Add the tickable to the line.
      this.tickables.push(tickable);
      tickable.setVoice(this);
      return this;
    },

    // Add an array of tickables to the voice.
    addTickables: function(tickables) {
      for (var i = 0; i < tickables.length; ++i) {
        this.addTickable(tickables[i]);
      }

      return this;
    },

    // Preformats the voice by applying the voice's stave to each note.
    preFormat: function(){
      if (this.preFormatted) return;

      this.tickables.forEach(function(tickable) {
        if (!tickable.getStave()) {
          tickable.setStave(this.stave);
        }
      }, this);

      this.preFormatted = true;
      return this;
    },

    // Render the voice onto the canvas `context` and an optional `stave`.
    // If `stave` is omitted, it is expected that the notes have staves
    // already set.
    draw: function(context, stave) {
      var boundingBox = null;
      for (var i = 0; i < this.tickables.length; ++i) {
        var tickable = this.tickables[i];

        // Set the stave if provided
        if (stave) tickable.setStave(stave);

        if (!tickable.getStave()) {
          throw new Vex.RuntimeError("MissingStave",
            "The voice cannot draw tickables without staves.");
        }

        if (i === 0) boundingBox = tickable.getBoundingBox();

        if (i > 0 && boundingBox) {
          var tickable_bb = tickable.getBoundingBox();
          if (tickable_bb) boundingBox.mergeWith(tickable_bb);
        }

       tickable.setContext(context);
       tickable.draw();
      }

      this.boundingBox = boundingBox;
    }
  };

  return Voice;
}());