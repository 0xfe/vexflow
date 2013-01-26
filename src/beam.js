// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires: vex.js, vexmusic.js, note.js

/**
 * Create a new beam from the specified notes. The notes must
 * be part of the same line, and have the same duration (in ticks).
 *
 * @constructor
 * @param {Array.<Vex.Flow.StaveNote>} A set of notes.
 */
Vex.Flow.Beam = function(notes, auto_stem) {
  if (arguments.length > 0) this.init(notes, auto_stem);
}

/**
 * Set the notes to attach this beam to.
 *
 * @param {Array.<Vex.Flow.StaveNote>} The notes.
 * @param auto_stem If true, will automatically set stem direction.
 */
Vex.Flow.Beam.prototype.init = function(notes, auto_stem) {
  if (!notes || notes == []) {
    throw new Vex.RuntimeError("BadArguments", "No notes provided for beam.");
  }

  if (notes.length == 1) {
    throw new Vex.RuntimeError("BadArguments", "Too few notes for beam.");
  }

  this.unbeamable = false;
  // Quit if first or last note is a rest.
  if (!notes[0].hasStem() || !notes[notes.length-1].hasStem()) {
    this.unbeamable = true;
    return;
  }

  // Validate beam line, direction and ticks.
  this.stem_direction = notes[0].getStemDirection();
  this.ticks = notes[0].getIntrinsicTicks();

  if (this.ticks >= Vex.Flow.durationToTicks("4")) {
    throw new Vex.RuntimeError("BadArguments",
        "Beams can only be applied to notes shorter than a quarter note.");
  }

  if (!auto_stem) {
    for (var i = 1; i < notes.length; ++i) {
      var note = notes[i];
      if (note.getStemDirection() != this.stem_direction) {
        throw new Vex.RuntimeError("BadArguments",
            "Notes in a beam all have the same stem direction");
      }
    }
  }

  var stem_direction = -1;

  if (auto_stem)  {
    // Figure out optimal stem direction based on given notes
    this.min_line = 1000;

    for (var i = 0; i < notes.length; ++i) {
      var note = notes[i];
      this.min_line = Vex.Min(note.getKeyProps()[0].line, this.min_line);
    }

    if (this.min_line < 3) stem_direction = 1;
  }

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    if (auto_stem) {
      note.setStemDirection(stem_direction);
      this.stem_direction = stem_direction;
    }
    note.setBeam(this);
  }

  this.notes = notes;
  this.beam_count = this.notes[0].getGlyph().beam_count;
  this.render_options = {
    beam_width: 5,
    max_slope: 0.25,
    min_slope: -0.25,
    slope_iterations: 20,
    slope_cost: 25
  };
}

Vex.Flow.Beam.prototype.setContext = function(context) {
  this.context = context; return this; }

/**
 * @return {Array.<Vex.Flow.Note>} Returns notes in this beam.
 */
Vex.Flow.Beam.prototype.getNotes = function() {
  return this.notes;
}

Vex.Flow.Beam.prototype.draw = function(notes) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");

  if (this.unbeamable) return;

  var first_note = this.notes[0];
  var last_note = this.notes[this.notes.length - 1];

  var first_y_px = first_note.getStemExtents().topY;
  var last_y_px = last_note.getStemExtents().topY;

  var first_x_px = first_note.getStemX();
  var last_x_px = last_note.getStemX();

  var beam_width = this.render_options.beam_width * this.stem_direction;

  // Returns the Y coordinate for the slope at position X.
  function getSlopeY(x) {
    return first_y_px + ((x - first_x_px) * slope);
  }

  var inc = (this.render_options.max_slope - this.render_options.min_slope) /
      this.render_options.slope_iterations;
  var min_cost = Number.MAX_VALUE;
  var best_slope = 0;
  var y_shift = 0;

  // iterate through slope values to find best weighted fit
  for (var slope = this.render_options.min_slope;
       slope <= this.render_options.max_slope;
       slope += inc) {
    var total_stem_extension = 0;
    var y_shift_tmp = 0;

    // iterate through notes, calculating y shift and stem extension
    for (var i = 1; i < this.notes.length; ++i) {
      var note = this.notes[i];

      var x_px = note.getStemX();
      var y_px = note.getStemExtents().topY;
      var slope_y_px = getSlopeY(x_px) + y_shift_tmp;

      // beam needs to be shifted up to accommodate note
      if (y_px * this.stem_direction < slope_y_px * this.stem_direction) {
        var diff =  Math.abs(y_px - slope_y_px);
        y_shift_tmp += diff * -this.stem_direction;
        total_stem_extension += (diff * i);
      } else { // beam overshoots note, account for the difference
        total_stem_extension += (y_px - slope_y_px) * this.stem_direction;
      }

    }
    var cost = this.render_options.slope_cost * Math.abs(slope) +
      Math.abs(total_stem_extension);

    // update state when a more ideal slope is found
    if (cost < min_cost) {
      min_cost = cost;
      best_slope = slope;
      y_shift = y_shift_tmp;
    }
  }

  slope = best_slope;

  // Draw the stems
  for (var i = 0; i < this.notes.length; ++i) {
    var note = this.notes[i];

    // Do not draw stem for rests
    if (!note.hasStem()) {
      continue;
    }

    var x_px = note.getStemX();
    var y_extents = note.getStemExtents();
    var base_y_px = y_extents.baseY;

    // For harmonic note heads, shorten stem length by 3 pixels
    base_y_px += this.stem_direction * note.glyph.stem_offset;

    // Draw the stem
    this.context.fillRect(x_px, base_y_px, 1,
        ((Math.abs(base_y_px - (getSlopeY(x_px) + y_shift)))) *
        -this.stem_direction);
  }

  var that = this;
  function getBeamLines(duration) {
    var beam_lines = [];
    var beam_started = false;

    for (var i = 0; i < that.notes.length; ++i) {
      var note = that.notes[i];
      var ticks = note.getIntrinsicTicks();

      // Check whether to apply beam(s)
      if (ticks < Vex.Flow.durationToTicks(duration)) {
        if (!beam_started) {
          beam_lines.push({start: note.getStemX(), end: null});
          beam_started = true;
        } else {
          var current_beam = beam_lines[beam_lines.length - 1];
          current_beam.end = note.getStemX();
        }
      } else {
        if (!beam_started) {
          // we don't care
        } else {
          var current_beam = beam_lines[beam_lines.length - 1];
          if (current_beam.end == null) {
            // single note
            current_beam.end = current_beam.start + 10; // TODO
          } else {
            // we don't care
          }
        }

        beam_started = false;
      }
    }

    if (beam_started == true) {
      var current_beam = beam_lines[beam_lines.length - 1];
      if (current_beam.end == null) {
        // single note
        current_beam.end = current_beam.start - 10; // TODO
      }
    }

    return beam_lines;
  }

  var valid_beam_durations = ["4", "8", "16", "32"];

  // Draw the beams.
  for (var i = 0; i < valid_beam_durations.length; ++i) {
    var duration = valid_beam_durations[i];
    var beam_lines = getBeamLines(duration);

    for (var j = 0; j < beam_lines.length; ++j) {
      var beam_line = beam_lines[j];
      var first_x = beam_line.start;
      var first_y = getSlopeY(first_x);

      var last_x = beam_line.end;
      var last_y = getSlopeY(last_x);

      this.context.beginPath();
      this.context.moveTo(first_x, first_y + y_shift);
      this.context.lineTo(first_x, first_y + beam_width + y_shift);
      this.context.lineTo(last_x + 1, last_y + beam_width + y_shift);
      this.context.lineTo(last_x + 1, last_y + y_shift);
      this.context.closePath();
      this.context.fill();
    }

    first_y_px += beam_width * 1.5;
    last_y_px += beam_width * 1.5;
  }

  return true;
}


Vex.Flow.Beam.applyAndGetBeams = function(voice, stem_direction) {
  var unprocessedNotes = voice.tickables;
  var ticksPerGroup    = 4096;
  var noteGroups       = [];
  var currentGroup     = [];

  function getTotalTicks(vf_notes){
    return vf_notes.reduce(function(memo,note){
      return note.getTicks().value() + memo;
    }, 0);
  }

  function createGroups(){
    var nextGroup = [];

    unprocessedNotes.forEach(function(unprocessedNote){
      nextGroup    = [];
      if (unprocessedNote.shouldIgnoreTicks()) {
        noteGroups.push(currentGroup);
        currentGroup = nextGroup;
        return; // Ignore untickables (like bar notes)
      }

      currentGroup.push(unprocessedNote);

      // If the note that was just added overflows the group tick total
      if (getTotalTicks(currentGroup) > ticksPerGroup) {
        nextGroup.push(currentGroup.pop());
        noteGroups.push(currentGroup);
        currentGroup = nextGroup;
      } else if (getTotalTicks(currentGroup) == ticksPerGroup) {
        noteGroups.push(currentGroup);
        currentGroup = nextGroup;
      }
    });

    // Adds any remainder notes
    if (currentGroup.length > 0)
      noteGroups.push(currentGroup);
  }

  function getBeamGroups() {
    return noteGroups.filter(function(group){
        if (group.length > 1) {
          var beamable = true;
          group.forEach(function(note) {
            if (note.getIntrinsicTicks() >= Vex.Flow.durationToTicks("4")) {
              beamable = false;
            }
          });
          return beamable;
        }
        return false;
    });
  }

  function formatStems() {
    noteGroups.forEach(function(group){
      var stemDirection = determineStemDirection(group);

      applyStemDirection(group, stemDirection);
    });
  }

  function determineStemDirection(group) {
    if (stem_direction) return stem_direction;

    var lineSum = 0;

    group.forEach(function(note) {
      note.keyProps.forEach(function(keyProp){
        lineSum += (keyProp.line - 3);
      });
    });

    if (lineSum > 0)
      return -1;
    return 1;
  }

  function applyStemDirection(group, direction) {
    group.forEach(function(note){
      note.setStemDirection(direction);
    });
  }

  function getTupletGroups() {
    return noteGroups.filter(function(group){
      if (group[0]) return group[0].tuplet;
    });
  }

  // Using closures to store the variables throughout the various functions
  // IMO Keeps it this process lot cleaner - but not super consistent with
  // the rest of the API's style - Silverwolf90 (Cyril)
  createGroups();
  formatStems();

  // Get the notes to be beamed
  var beamedNoteGroups = getBeamGroups();

  // Get the tuplets in order to format them accurately
  var tupletGroups = getTupletGroups();

  // Create a Vex.Flow.Beam from each group of notes to be beamed
  var beams = [];
  beamedNoteGroups.forEach(function(group){
    beams.push(new Vex.Flow.Beam(group));
  });

  // Reformat tuplets
  tupletGroups.forEach(function(group){
    var firstNote = group[0];
    var tuplet = firstNote.tuplet;

    if (firstNote.beam) tuplet.setBracketed(false);
    if (firstNote.stem_direction == -1) {
      tuplet.setTupletLocation( Vex.Flow.Tuplet.LOCATION_BOTTOM);
    }
  });

  return beams;
};
