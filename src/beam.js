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
Vex.Flow.Beam = function(notes) {
  if (arguments.length > 0) this.init(notes);
}

/**
 * Set the notes to attach this beam to.
 *
 * @param {Array.<Vex.Flow.StaveNote>} The notes.
 */
Vex.Flow.Beam.prototype.init = function(notes) {
  if (!notes || notes == []) {
    throw new Vex.RuntimeError("BadArguments", "No notes provided for beam.");
  }

  if (notes.length == 1) {
    throw new Vex.RuntimeError("BadArguments", "Too few notes for beam.");
  }

  // Validate beam line, direction and ticks.
  this.stem_direction = notes[0].getStemDirection();
  this.ticks = notes[0].getTicks();

  if (this.ticks > Vex.Flow.durationToTicks["8d"]) {
    throw new Vex.RuntimeError("BadArguments",
        "Beams can be at most dotted eighth notes.");
  }

  for (var i = 1; i < notes.length; ++i) {
    var note = notes[i];
    if (note.getStemDirection() != this.stem_direction) {
      throw new Vex.RuntimeError("BadArguments",
          "Notes in a beam all have the same stem direction");
    }

    /*
    if (note.getTicks() != this.ticks) {
      throw new Vex.RuntimeError("BadArguments",
          "Notes in a beam should have the same duration.");
    }
    */
  }

  // Success. Lets grab 'em notes.
  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    note.setBeam(this);
  }

  this.notes = notes;
  this.beam_count =
    Vex.Flow.durationToGlyph(this.notes[0].getDuration()).beam_count;
  this.render_options = { beam_width: 5 };
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

  var first_note = this.notes[0];
  var last_note = this.notes[this.notes.length - 1];

  var first_y_px = first_note.getStemExtents().topY;
  var last_y_px = last_note.getStemExtents().topY;

  var first_x_px = first_note.getStemX();
  var last_x_px = last_note.getStemX();

  var beam_width = this.render_options.beam_width * this.stem_direction;

  // Calculate slope for beam.
  var slope = (last_y_px - first_y_px) / (last_x_px - first_x_px);

  // Returns the Y coordinate for the slope at position X.
  function getSlopeY(x) {
    return first_y_px + ((x - first_x_px) * slope);
  }

  // Iterate over notes, shifting beam up if necessary.
  var y_shift = 0;
  for (var i = 1; i < this.notes.length; ++i) {
    var note = this.notes[i];

    var x_px = note.getStemX();
    var y_px = note.getStemExtents().topY;
    var slope_y_px = getSlopeY(x_px);

    if ((y_px + y_shift) * this.stem_direction <
         slope_y_px * this.stem_direction) {
      y_shift += Math.abs(y_px - slope_y_px) * -this.stem_direction;
    }
  }

  // Draw the stems
  for (var i = 0; i < this.notes.length; ++i) {
    var note = this.notes[i];
    var x_px = note.getStemX();
    var y_extents = note.getStemExtents();
    var base_y_px = y_extents.baseY;

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
      var ticks = note.getTicks();

      // Atleast 8th note
      if (ticks <= Vex.Flow.durationToTicks[duration]) {
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

  var valid_beam_durations = ["8d", "16d", "32d"];

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
