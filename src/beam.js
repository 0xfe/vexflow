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
Vex.Flow.Beam = (function() {
  function Beam(notes, auto_stem) {
    if (arguments.length > 0) this.init(notes, auto_stem);
  }

  Beam.prototype = {
    /**
     * Set the notes to attach this beam to.
     *
     * @param {Array.<Vex.Flow.StaveNote>} The notes.
     * @param auto_stem If true, will automatically set stem direction.
     */
    init: function(notes, auto_stem) {
      if (!notes || notes == []) {
        throw new Vex.RuntimeError("BadArguments", "No notes provided for beam.");
      }

      if (notes.length == 1) {
        throw new Vex.RuntimeError("BadArguments", "Too few notes for beam.");
      }

      // Validate beam line, direction and ticks.
      this.ticks = notes[0].getIntrinsicTicks();

      if (this.ticks >= Vex.Flow.durationToTicks("4")) {
        throw new Vex.RuntimeError("BadArguments",
            "Beams can only be applied to notes shorter than a quarter note.");
      }

      var i; // shared iterator
      var note;

      this.stem_direction = 1;

      for (i = 0; i < notes.length; ++i) {
        note = notes[i];
        if (note.hasStem()) {
          this.stem_direction = note.getStemDirection();
          break;
        }
      }

      var stem_direction = -1;

      // Figure out optimal stem direction based on given notes
      if (auto_stem && notes[0].getCategory() === 'stavenotes')  {
        // Auto Stem StaveNotes
        this.min_line = 1000;

        for (i = 0; i < notes.length; ++i) {
          note = notes[i];
          if (note.getKeyProps) {
            this.min_line = Vex.Min(note.getKeyProps()[0].line, this.min_line);
          }
        }

        if (this.min_line < 3) stem_direction = 1;
      } else if (auto_stem && notes[0].getCategory() === 'tabnotes') {
        // Auto Stem TabNotes
        var stem_weight = notes.reduce(function(memo, note) {
          return memo + note.stem_direction;
        }, 0);

        stem_direction = stem_weight > -1 ? 1 : -1;
      }

      // Apply stem directions and attach beam to notes
      for (i = 0; i < notes.length; ++i) {
        note = notes[i];
        if (auto_stem) {
          note.setStemDirection(stem_direction);
          this.stem_direction = stem_direction;
        }
        note.setBeam(this);
      }

      this.notes = notes;
      this.beam_count = this.getBeamCount();
      this.break_on_indices = [];
      this.render_options = {
        beam_width: 5,
        max_slope: 0.25,
        min_slope: -0.25,
        slope_iterations: 20,
        slope_cost: 25,
        show_stemlets: false,
        stemlet_extension: 7,
        partial_beam_length: 10
      };
    },

    setContext: function(context) { this.context = context; return this; },

    /**
     * @return {Array.<Vex.Flow.Note>} Returns notes in this beam.
     */
    getNotes: function() { return this.notes; },

    getBeamCount: function(){
      var beamCounts =  this.notes.map(function(note) {
        return note.getGlyph().beam_count;
      });

      var maxBeamCount =  beamCounts.reduce(function(max, beamCount) {
          return beamCount > max ? beamCount : max;
      });

      return maxBeamCount;
    },

    setSecondaryBeamBreakIndices: function(indices) {
      this.break_on_indices = indices;
      return this;
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      if (this.unbeamable) return;

      var first_note = this.notes[0];
      var last_note = this.notes[this.notes.length - 1];

      var first_y_px = first_note.getStemExtents().topY;
      var last_y_px = last_note.getStemExtents().topY;

      var first_x_px = first_note.getStemX();

      var beam_width = this.render_options.beam_width * this.stem_direction;
      var x_px, i, note; // shared variables

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
        for (i = 1; i < this.notes.length; ++i) {
          note = this.notes[i];

          x_px = note.getStemX();
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
        /*
          // This causes too many zero-slope beams.

          var cost = this.render_options.slope_cost * Math.abs(slope) +
            Math.abs(total_stem_extension);
        */

        // Pick a beam that minimizes stem extension.
        var cost = Math.abs(total_stem_extension);

        // update state when a more ideal slope is found
        if (cost < min_cost) {
          min_cost = cost;
          best_slope = slope;
          y_shift = y_shift_tmp;
        }
      }

      slope = best_slope;

      // Draw the stems
      for (i = 0; i < this.notes.length; ++i) {
        note = this.notes[i];

        x_px = note.getStemX();
        var y_extents = note.getStemExtents();
        var base_y_px = y_extents.baseY;

        // For harmonic note heads, shorten stem length by 3 pixels
        base_y_px += this.stem_direction * note.glyph.stem_offset;

        // Don't go all the way to the top (for thicker stems)
        var y_displacement = Vex.Flow.STEM_WIDTH;

        if (!note.hasStem()) {
          if (note.isRest() && this.render_options.show_stemlets) {
            var centerGlyphX = note.getCenterGlyphX();

            var width = this.render_options.beam_width;
            var total_width = ((this.beam_count - 1)* width * 1.5) + width;

            var stemlet_height = (total_width - y_displacement +
              this.render_options.stemlet_extension);

            var beam_y = (getSlopeY(centerGlyphX) + y_shift);
            var start_y = beam_y + (Vex.Flow.Stem.HEIGHT * this.stem_direction);
            var end_y = beam_y + (stemlet_height * this.stem_direction);

            // Draw Stemlet
            note.drawStem({
              x_begin: centerGlyphX,
              x_end: centerGlyphX,
              y_bottom: this.stem_direction === 1 ? end_y : start_y,
              y_top: this.stem_direction === 1 ? start_y : end_y,
              y_extend: y_displacement,
              stem_extension: 0,
              stem_direction: this.stem_direction
            });
          }

          continue;
        }

        note.drawStem({
          x_begin: x_px,
          x_end: x_px,
          y_top: base_y_px,
          y_bottom: base_y_px,
          y_extend: y_displacement,
          stem_extension: Math.abs(base_y_px - (getSlopeY(x_px) + y_shift)) -
                          Vex.Flow.Stem.HEIGHT,
          stem_direction: this.stem_direction
        });
      }

      var that = this;
      function getBeamLines(duration) {
        var beam_lines = [];
        var beam_started = false;
        var current_beam;

        for (var i = 0; i < that.notes.length; ++i) {
          var note = that.notes[i];
          var ticks = note.getIntrinsicTicks();

          var stem_x = note.isRest() ? note.getCenterGlyphX() : note.getStemX();

          // Check whether to apply beam(s)
          if (ticks < Vex.Flow.durationToTicks(duration)) {
            if (!beam_started) {
              beam_lines.push({start: stem_x, end: null});
              beam_started = true;
            } else {
              current_beam = beam_lines[beam_lines.length - 1];
              current_beam.end = stem_x;

              // Should break secondary beams on note
              var should_break = that.break_on_indices.indexOf(i) !== -1;
              // Shorter than or eq an 8th note duration
              var can_break = parseInt(duration, 10) >= 8; 
              if (should_break  && can_break) {
                beam_started = false;
              }
            }
          } else {
            if (!beam_started) {
              // we don't care
            } else {
              current_beam = beam_lines[beam_lines.length - 1];
              if (current_beam.end == null) {
                // single note
                current_beam.end = current_beam.start +
                                   that.render_options.partial_beam_length;
              } else {
                // we don't care
              }
            }

            beam_started = false;
          }
        }

        if (beam_started === true) {
          current_beam = beam_lines[beam_lines.length - 1];
          if (current_beam.end == null) {
            // single note
            current_beam.end = current_beam.start -
                that.render_options.partial_beam_length - Vex.Flow.STEM_WIDTH;
          }
        }

        return beam_lines;
      }

      var valid_beam_durations = ["4", "8", "16", "32"];

      // Draw the beams.
      for (i = 0; i < valid_beam_durations.length; ++i) {
        var duration = valid_beam_durations[i];
        var beam_lines = getBeamLines(duration);

        for (var j = 0; j < beam_lines.length; ++j) {
          var beam_line = beam_lines[j];
          var first_x = beam_line.start;
          var first_y = getSlopeY(first_x);

          var last_x = beam_line.end + (Vex.Flow.STEM_WIDTH / 2);
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
  };

  Beam.getDefaultBeamGroups = function(time_sig){
    if (!time_sig || time_sig == "c") time_sig = "4/4";

    var defaults = {
      '1/2' :  ['1/2'],
      '2/2' :  ['1/2'],
      '3/2' :  ['1/2'],
      '4/2' :  ['1/2'],

      '1/4' :  ['1/4'],
      '2/4' :  ['1/4'],
      '3/4' :  ['1/4'],
      '4/4' :  ['1/4'],

      '1/8' :  ['1/8'],
      '2/8' :  ['2/8'],
      '3/8' :  ['3/8'],
      '4/8' :  ['2/8'],

      '1/16' : ['1/16'],
      '2/16' : ['2/16'],
      '3/16' : ['3/16'],
      '4/16' : ['2/16']
    };

    var Fraction = Vex.Flow.Fraction;
    var groups = defaults[time_sig];

    if (!groups) {
      // If no beam groups found, naively determine
      // the beam groupings from the time signature
      var beatTotal = parseInt(time_sig.split('/')[0], 10);
      var beatValue = parseInt(time_sig.split('/')[1], 10);

      var tripleMeter = beatTotal % 3 === 0;

      if (tripleMeter) {
        return [new Fraction(3, beatValue)];
      } else if (beatValue > 4) {
        return [new Fraction(2, beatValue)];
      } else if (beatValue <= 4) {
        return [new Fraction(1, beatValue)];
      }
    } else {
      return groups.map(function(group) {
        return new Fraction().parse(group);
      });
    }
  };

  // Static method: Automatically beam notes in "voice". If "stem_direction"
  // is set, then force all stems to that direction (used for multi-voice music).
  Beam.applyAndGetBeams = function(voice, stem_direction, groups) {
    return Beam.generateBeams(voice.getTickables(), {
      groups: groups,
      stem_direction: stem_direction
    });
  };

  Beam.generateBeams = function(notes, config) {
    // Example configuration object:
    //
    // config = {
    //   groups: [new Vex.Flow.Fraction(2, 8)],   // Beam groups
    //   stem_direction: -1,                     // leave undefined for auto
    //   beam_rests: true,
    //   beam_middle_only: true,
    //   show_stemlets: false
    // };

    if (!config) config = {};

    if (!config.groups || !config.groups.length) {
      config.groups = [new Vex.Flow.Fraction(2, 8)];
    }

    // Convert beam groups to tick amounts
    var tickGroups = config.groups.map(function(group) {
      if (!group.multiply) {
        throw new Vex.RuntimeError("InvalidBeamGroups",
          "The beam groups must be an array of Vex.Flow.Fractions");
      }
      return group.clone().multiply(Vex.Flow.RESOLUTION, 1);
    });

    var unprocessedNotes = notes;
    var currentTickGroup = 0;
    var noteGroups       = [];
    var currentGroup     = [];

    function getTotalTicks(vf_notes){
      return vf_notes.reduce(function(memo,note){
        return note.getTicks().clone().add(memo);
      }, new Vex.Flow.Fraction(0, 1));
    }

    function nextTickGroup() {
      if (tickGroups.length - 1 > currentTickGroup) {
        currentTickGroup += 1;
      } else {
        currentTickGroup = 0;
      }
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
        var ticksPerGroup = tickGroups[currentTickGroup].value();
        var totalTicks = getTotalTicks(currentGroup).value();

        // Double the amount of ticks in a group, if it's an unbeamable tuplet
        if (parseInt(unprocessedNote.duration, 10) < 8 && unprocessedNote.tuplet) {
          ticksPerGroup *= 2;
        }

        // If the note that was just added overflows the group tick total
        if (totalTicks > ticksPerGroup) {
          nextGroup.push(currentGroup.pop());
          noteGroups.push(currentGroup);
          currentGroup = nextGroup;
          nextTickGroup();
        } else if (totalTicks == ticksPerGroup) {
          noteGroups.push(currentGroup);
          currentGroup = nextGroup;
          nextTickGroup();
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

    // Splits up groups by Rest
    function sanitizeGroups() {
      var sanitizedGroups = [];
      noteGroups.forEach(function(group) {
        var tempGroup = [];
        group.forEach(function(note, index, group) {
          var isFirstOrLast = index === 0 || index === group.length - 1;

          var breaksOnEachRest = !config.beam_rests && note.isRest();
          var breaksOnFirstOrLastRest = (config.beam_rests &&
            config.beam_middle_only && note.isRest() && isFirstOrLast);

          var shouldBreak = breaksOnEachRest || breaksOnFirstOrLastRest;

          if (shouldBreak) {
            if (tempGroup.length > 0) {
              sanitizedGroups.push(tempGroup);
            }
            tempGroup = [];
          } else {
            tempGroup.push(note);
          }
        });

        if (tempGroup.length > 0) {
          sanitizedGroups.push(tempGroup);
        }
      });

      noteGroups = sanitizedGroups;
    }

    function formatStems() {
      noteGroups.forEach(function(group){
        var stemDirection = determineStemDirection(group);
        applyStemDirection(group, stemDirection);
      });
    }

    function determineStemDirection(group) {
      if (config.stem_direction) return config.stem_direction;

      var lineSum = 0;
      group.forEach(function(note) {
        if (note.keyProps) {
          note.keyProps.forEach(function(keyProp){
            lineSum += (keyProp.line - 2.5);
          });
        }
      });

      if (lineSum > 0)
        return -1;
      return 1;
    }

    function applyStemDirection(group, direction) {
      group.forEach(function(note){
        if (note.hasStem()) note.setStemDirection(direction);
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
    sanitizeGroups();
    formatStems();

    // Get the notes to be beamed
    var beamedNoteGroups = getBeamGroups();

    // Get the tuplets in order to format them accurately
    var tupletGroups = getTupletGroups();

    // Create a Vex.Flow.Beam from each group of notes to be beamed
    var beams = [];
    beamedNoteGroups.forEach(function(group){
      var beam = new Vex.Flow.Beam(group);

      if (config.show_stemlets) {
        beam.render_options.show_stemlets = true;
      }

      beams.push(beam);
    });

    // Reformat tuplets
    tupletGroups.forEach(function(group){
      var firstNote = group[0];
      for (var i=0; i<group.length; ++i) {
        if (group[i].hasStem()) {
          firstNote = group[i];
          break;
        }
      }

      var tuplet = firstNote.tuplet;

      if (firstNote.beam) tuplet.setBracketed(false);
      if (firstNote.stem_direction == -1) {
        tuplet.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
      }
    });

    return beams;
  };

  return Beam;
}());
