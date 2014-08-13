// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `Beams` that span over a set of `StemmableNotes`.
//
// Requires: vex.js, vexmusic.js, note.js
Vex.Flow.Beam = (function() {
  function Beam(notes, auto_stem) {
    if (arguments.length > 0) this.init(notes, auto_stem);
  }

  var Stem = Vex.Flow.Stem;

  // ## Prototype Methods
  Beam.prototype = {
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

      this.stem_direction = Stem.UP;

      for (i = 0; i < notes.length; ++i) {
        note = notes[i];
        if (note.hasStem()) {
          this.stem_direction = note.getStemDirection();
          break;
        }
      }

      var stem_direction = this.stem_direction;
      // Figure out optimal stem direction based on given notes
      if (auto_stem && notes[0].getCategory() === 'stavenotes')  {
        stem_direction = calculateStemDirection(notes);
      } else if (auto_stem && notes[0].getCategory() === 'tabnotes') {
        // Auto Stem TabNotes
        var stem_weight = notes.reduce(function(memo, note) {
          return memo + note.stem_direction;
        }, 0);

        stem_direction = stem_weight > -1 ? Stem.UP : Stem.DOWN;
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

      this.postFormatted = false;
      this.notes = notes;
      this.beam_count = this.getBeamCount();
      this.break_on_indices = [];
      this.render_options = {
        beam_width: 5,
        max_slope: 0.25,
        min_slope: -0.25,
        slope_iterations: 20,
        slope_cost: 100,
        show_stemlets: false,
        stemlet_extension: 7,
        partial_beam_length: 10
      };
    },

    // The the rendering `context`
    setContext: function(context) { this.context = context; return this; },

    // Get the notes in this beam
    getNotes: function() { return this.notes; },

    // Get the max number of beams in the set of notes
    getBeamCount: function(){
      var beamCounts =  this.notes.map(function(note) {
        return note.getGlyph().beam_count;
      });

      var maxBeamCount =  beamCounts.reduce(function(max, beamCount) {
          return beamCount > max ? beamCount : max;
      });

      return maxBeamCount;
    },

    // Set which note `indices` to break the secondary beam at
    breakSecondaryAt: function(indices) {
      this.break_on_indices = indices;
      return this;
    },

    // Return the y coordinate for linear function
    getSlopeY: function(x, first_x_px, first_y_px, slope) {
      return first_y_px + ((x - first_x_px) * slope);
    },

    // Calculate the best possible slope for the provided notes
    calculateSlope: function() {
      var first_note = this.notes[0];
      var first_y_px = first_note.getStemExtents().topY;
      var first_x_px = first_note.getStemX();

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
          var slope_y_px = this.getSlopeY(x_px, first_x_px, first_y_px, slope) + y_shift_tmp;

          // beam needs to be shifted up to accommodate note
          if (y_px * this.stem_direction < slope_y_px * this.stem_direction) {
            var diff =  Math.abs(y_px - slope_y_px);
            y_shift_tmp += diff * -this.stem_direction;
            total_stem_extension += (diff * i);
          } else { // beam overshoots note, account for the difference
            total_stem_extension += (y_px - slope_y_px) * this.stem_direction;
          }

        }

        var last_note = this.notes[this.notes.length - 1];
        var first_last_slope = ((last_note.getStemExtents().topY - first_y_px) /
                (last_note.getStemX() - first_x_px));
        // most engraving books suggest aiming for a slope about half the angle of the
        // difference between the first and last notes' stem length;
        var ideal_slope = first_last_slope / 2;
        var distance_from_ideal = Math.abs(ideal_slope - slope);

        // This tries to align most beams to something closer to the ideal_slope, but
        // doesn't go crazy. To disable, set this.render_options.slope_cost = 0
        var cost = this.render_options.slope_cost * distance_from_ideal +
            Math.abs(total_stem_extension);

        // update state when a more ideal slope is found
        if (cost < min_cost) {
          min_cost = cost;
          best_slope = slope;
          y_shift = y_shift_tmp;
        }
      }

      this.slope = best_slope;
      this.y_shift = y_shift;
    },

    // Create new stems for the notes in the beam, so that each stem
    // extends into the beams.
    applyStemExtensions: function(){
      var first_note = this.notes[0];
      var first_y_px = first_note.getStemExtents().topY;
      var first_x_px = first_note.getStemX();

      for (var i = 0; i < this.notes.length; ++i) {
        var note = this.notes[i];

        var x_px = note.getStemX();
        var y_extents = note.getStemExtents();
        var base_y_px = y_extents.baseY;
        var top_y_px = y_extents.topY;

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

            var beam_y = this.getSlopeY(centerGlyphX, first_x_px,
                            first_y_px, this.slope) + this.y_shift;
            var start_y = beam_y + (Vex.Flow.Stem.HEIGHT * this.stem_direction);
            var end_y = beam_y + (stemlet_height * this.stem_direction);

            // Draw Stemlet
            note.setStem(new Vex.Flow.Stem({
              x_begin: centerGlyphX,
              x_end: centerGlyphX,
              y_bottom: this.stem_direction === 1 ? end_y : start_y,
              y_top: this.stem_direction === 1 ? start_y : end_y,
              y_extend: y_displacement,
              stem_extension: -1, // To avoid protruding through the beam
              stem_direction: this.stem_direction
            }));
          }

          continue;
        }

        var slope_y = this.getSlopeY(x_px, first_x_px, first_y_px,
                        this.slope) + this.y_shift;

        note.setStem(new Vex.Flow.Stem({
          x_begin: x_px - (Vex.Flow.STEM_WIDTH/2),
          x_end: x_px,
          y_top: this.stem_direction === 1 ? top_y_px : base_y_px,
          y_bottom: this.stem_direction === 1 ? base_y_px :  top_y_px ,
          y_extend: y_displacement,
          stem_extension: Math.abs(top_y_px - slope_y) - Stem.HEIGHT - 1,
          stem_direction: this.stem_direction
        }));
      }
    },

    // Get the x coordinates for the beam lines of specific `duration`
    getBeamLines: function(duration) {
      var beam_lines = [];
      var beam_started = false;
      var current_beam;
      var partial_beam_length = this.render_options.partial_beam_length;

      function determinePartialSide (prev_note, next_note){
          // Compare beam counts and store differences
          var unshared_beams = 0;
          if (next_note && prev_note) {
            unshared_beams = prev_note.getBeamCount() - next_note.getBeamCount();
          }

          var left_partial = duration !== "8" && unshared_beams > 0;
          var right_partial = duration !== "8" && unshared_beams < 0;

          return {
            left: left_partial,
            right: right_partial
          };
        }

      for (var i = 0; i < this.notes.length; ++i) {
        var note = this.notes[i];
        var prev_note = this.notes[i-1];
        var next_note = this.notes[i+1];
        var ticks = note.getIntrinsicTicks();
        var partial = determinePartialSide(prev_note, next_note);
        var stem_x = note.isRest() ? note.getCenterGlyphX() : note.getStemX();

        // Check whether to apply beam(s)
        if (ticks < Vex.Flow.durationToTicks(duration)) {
          if (!beam_started) {
            var new_line = {start: stem_x, end: null};

            if (partial.left) {
              new_line.end = stem_x - partial_beam_length;
            }

            beam_lines.push(new_line);
            beam_started = true;
          } else {
            current_beam = beam_lines[beam_lines.length - 1];
            current_beam.end = stem_x;

            // Should break secondary beams on note
            var should_break = this.break_on_indices.indexOf(i) !== -1;
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
                                 partial_beam_length;
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
              partial_beam_length;
        }
      }

      return beam_lines;
    },

    // Render the stems for each notes
    drawStems: function() {
      this.notes.forEach(function(note) {
        if (note.getStem()) {
          note.getStem().setContext(this.context).draw();
        }
      }, this);
    },

    // Render the beam lines
    drawBeamLines: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      var valid_beam_durations = ["4", "8", "16", "32", "64"];

      var first_note = this.notes[0];
      var last_note = this.notes[this.notes.length - 1];

      var first_y_px = first_note.getStemExtents().topY;
      var last_y_px = last_note.getStemExtents().topY;

      var first_x_px = first_note.getStemX();

      var beam_width = this.render_options.beam_width * this.stem_direction;

      // Draw the beams.
      for (var i = 0; i < valid_beam_durations.length; ++i) {
        var duration = valid_beam_durations[i];
        var beam_lines = this.getBeamLines(duration);

        for (var j = 0; j < beam_lines.length; ++j) {
          var beam_line = beam_lines[j];
          var first_x = beam_line.start - (this.stem_direction == Stem.DOWN ? Vex.Flow.STEM_WIDTH/2:0);
          var first_y = this.getSlopeY(first_x, first_x_px, first_y_px, this.slope);

          var last_x = beam_line.end +
            (this.stem_direction == 1 ? (Vex.Flow.STEM_WIDTH/3):(-Vex.Flow.STEM_WIDTH/3));
          var last_y = this.getSlopeY(last_x, first_x_px, first_y_px, this.slope);

          this.context.beginPath();
          this.context.moveTo(first_x, first_y + this.y_shift);
          this.context.lineTo(first_x, first_y + beam_width + this.y_shift);
          this.context.lineTo(last_x + 1, last_y + beam_width + this.y_shift);
          this.context.lineTo(last_x + 1, last_y + this.y_shift);
          this.context.closePath();
          this.context.fill();
        }

        first_y_px += beam_width * 1.5;
        last_y_px += beam_width * 1.5;
      }
    },

    // Pre-format the beam
    preFormat: function() { return this; },

    // Post-format the beam. This can only be called after
    // the notes in the beam have both `x` and `y` values. ie: they've 
    // been formatted and have staves
    postFormat: function() {
      if (this.postFormatted) return;

      this.calculateSlope();
      this.applyStemExtensions();

      this.postFormatted = true;
    },

    // Render the beam to the canvas context
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      if (this.unbeamable) return;

      if (!this.postFormatted) {
        this.postFormat();
      }

      this.drawStems();
      this.drawBeamLines();

      return true;
    }
  };

  function calculateStemDirection(notes) {
    var lineSum = 0;
    notes.forEach(function(note) {
      if (note.keyProps) {
        note.keyProps.forEach(function(keyProp){
          lineSum += (keyProp.line - 3);
        });
      }
    });

    if (lineSum >= 0)
      return Stem.DOWN;
    return Stem.UP;
  }

  // ## Static Methods
  //
  // Gets the default beam groups for a provided time signature.
  // Attempts to guess if the time signature is not found in table.
  // Currently this is fairly naive.
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

  // A helper function to automatically build basic beams for a voice. For more
  // complex auto-beaming use `Beam.generateBeams()`.
  //
  // Parameters:
  // * `voice` - The voice to generate the beams for
  // * `stem_direction` - A stem direction to apply to the entire voice
  // * `groups` - An array of `Fraction` representing beat groupings for the beam
  Beam.applyAndGetBeams = function(voice, stem_direction, groups) {
    return Beam.generateBeams(voice.getTickables(), {
      groups: groups,
      stem_direction: stem_direction
    });
  };

  // A helper function to autimatically build beams for a voice with
  // configuration options.
  //
  // Example configuration object:
  //
  // ```
  // config = {
  //   groups: [new Vex.Flow.Fraction(2, 8)],
  //   stem_direction: -1,
  //   beam_rests: true,
  //   beam_middle_only: true,
  //   show_stemlets: false
  // };
  // ```
  //
  // Parameters:
  // * `notes` - An array of notes to create the beams for
  // * `config` - The configuration object
  //    * `groups` - Array of `Fractions` that represent the beat structure to beam the notes
  //    * `stem_direction` - Set to apply the same direction to all notes
  //    * `beam_rests` - Set to `true` to include rests in the beams
  //    * `beam_middle_only` - Set to `true` to only beam rests in the middle of the beat
  //    * `show_stemlets` - Set to `true` to draw stemlets for rests
  //    * `maintain_stem_directions` - Set to `true` to not apply new stem directions
  //
  Beam.generateBeams = function(notes, config) {

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
        var ticksPerGroup = tickGroups[currentTickGroup].clone();
        var totalTicks = getTotalTicks(currentGroup);

        // Double the amount of ticks in a group, if it's an unbeamable tuplet
        var unbeamable = Vex.Flow.durationToNumber(unprocessedNote.duration) < 8;
        if (unbeamable && unprocessedNote.tuplet) {
          ticksPerGroup.numerator *= 2;
        }

        // If the note that was just added overflows the group tick total
        if (totalTicks.greaterThan(ticksPerGroup)) {
          // If the overflow note can be beamed, start the next group
          // with it. Unbeamable notes leave the group overflowed.
          if (!unbeamable) {
            nextGroup.push(currentGroup.pop());
          }
          noteGroups.push(currentGroup);
          currentGroup = nextGroup;
          nextTickGroup();
        } else if (totalTicks.equals(ticksPerGroup)) {
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
          var prevNote = group[index-1];

          var breaksOnEachRest = !config.beam_rests && note.isRest();
          var breaksOnFirstOrLastRest = (config.beam_rests &&
            config.beam_middle_only && note.isRest() && isFirstOrLast);

          var breakOnStemChange = false;
          if (config.maintain_stem_directions && prevNote &&
              !note.isRest() && !prevNote.isRest()) {
            var prevDirection = prevNote.getStemDirection();
            var currentDirection = note.getStemDirection();
            breakOnStemChange = currentDirection !== prevDirection;
          }

          var isUnbeamableDuration = parseInt(note.duration, 10) < 8;

          // Determine if the group should be broken at this note
          var shouldBreak = breaksOnEachRest || breaksOnFirstOrLastRest ||
                            breakOnStemChange || isUnbeamableDuration;

          if (shouldBreak) {
            // Add current group
            if (tempGroup.length > 0) {
              sanitizedGroups.push(tempGroup);
            }

            // Start a new group. Include the current note if the group
            // was broken up by stem direction, as that note needs to start
            // the next group of notes
            tempGroup = breakOnStemChange ? [note] : [];
          } else {
            // Add note to group
            tempGroup.push(note);
          }
        });

        // If there is a remaining group, add it as well
        if (tempGroup.length > 0) {
          sanitizedGroups.push(tempGroup);
        }
      });

      noteGroups = sanitizedGroups;
    }

    function formatStems() {
      noteGroups.forEach(function(group){
        var stemDirection;
        if (config.maintain_stem_directions) {
          var note = findFirstNote(group);
          stemDirection = note ? note.getStemDirection() : Stem.UP;
        } else {
          if (config.stem_direction){
            stemDirection = config.stem_direction;
          } else {
            stemDirection = calculateStemDirection(group);
          }
        }
        applyStemDirection(group, stemDirection);
      });
    }

    function findFirstNote(group) {
      for (var i = 0; i < group.length; i++) {
        var note = group[i];
        if (!note.isRest()) {
          return note;
        }
      }

      return false;
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
      if (firstNote.stem_direction == Stem.DOWN) {
        tuplet.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
      }
    });

    return beams;
  };

  return Beam;
}());
