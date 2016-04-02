// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// @author Greg Ristow (modifications)
//
// ## Description
//
// This file implements accidentals as modifiers that can be attached to
// notes. Support is included for both western and microtonal accidentals.
//
// See `tests/accidental_tests.js` for usage examples.

Vex.Flow.Accidental = (function(){
  function Accidental(type) {
    if (arguments.length > 0) this.init(type);
  }
  Accidental.CATEGORY = "accidentals";

  // To enable logging for this class. Set `Vex.Flow.Accidental.DEBUG` to `true`.
  function L() { if (Accidental.DEBUG) Vex.L("Vex.Flow.Accidental", arguments); }

  var Modifier = Vex.Flow.Modifier;

  // ## Static Methods
  //
  // Arrange accidentals inside a ModifierContext.
  Accidental.format = function(accidentals, state) {
    var left_shift = state.left_shift;
    var accidental_spacing = 2;

    // If there are no accidentals, we needn't format their positions
    if (!accidentals || accidentals.length === 0) return false;

    var acc_list = [];
    var hasStave = false;
    var prev_note = null;
    var shiftL = 0;

    // First determine the accidentals' Y positions from the note.keys
    var i, acc, props_tmp;
    for (i = 0; i < accidentals.length; ++i) {
      acc = accidentals[i];
      var note = acc.getNote();
      var stave = note.getStave();
      var props = note.getKeyProps()[acc.getIndex()];
      if (note != prev_note) {
         // Iterate through all notes to get the displaced pixels
         for (var n = 0; n < note.keys.length; ++n) {
            props_tmp = note.getKeyProps()[n];
            shiftL = (props_tmp.displaced ? note.getExtraLeftPx() : shiftL);
          }
          prev_note = note;
      }
      if (stave !== null) {
        hasStave = true;
        var line_space = stave.options.spacing_between_lines_px;
        var y = stave.getYForLine(props.line);
        var acc_line = Math.round(y / line_space * 2)/2;
        acc_list.push({ y: y, line: acc_line, shift: shiftL, acc: acc, lineSpace: line_space });
      } else {
        acc_list.push({ line: props.line, shift: shiftL, acc: acc });
      }
    }

    // Sort accidentals by line number.
    acc_list.sort(function(a, b) { return (b.line - a.line); });

    // Create an array of unique line numbers (line_list) from acc_list
    var line_list = []; // an array of unique line numbers
    var acc_shift = 0; // amount by which all accidentals must be shifted right or left for stem flipping, notehead shifting concerns.
    var previous_line = null;

    for(i = 0; i<acc_list.length; i++) {
      acc = acc_list[i];

      // if this is the first line, or a new line, add a line_list
      if( (previous_line === null) || (previous_line != acc.line) ) {
        line_list.push({line : acc.line, flat_line : true, dbl_sharp_line: true, num_acc : 0, width : 0});
      }
      // if this accidental is not a flat, the accidental needs 3.0 lines lower
      // clearance instead of 2.5 lines for b or bb.
      if( (acc.acc.type != "b") && (acc.acc.type !="bb") ) {
        line_list[line_list.length - 1].flat_line = false;
      }
      // if this accidental is not a double sharp, the accidental needs 3.0 lines above
      if( acc.acc.type != "##")
        line_list[line_list.length - 1].dbl_sharp_line = false;

      // Track how many accidentals are on this line:
      line_list[line_list.length - 1].num_acc++;

      // Track the total x_offset needed for this line which will be needed
      // for formatting lines w/ multiple accidentals:

      //width = accidental width + universal spacing between accidentals
      line_list[line_list.length - 1].width += acc.acc.getWidth() + accidental_spacing;

      // if this acc_shift is larger, use it to keep first column accidentals in the same line
      acc_shift = ( (acc.shift > acc_shift) ? acc.shift : acc_shift);

      previous_line = acc.line;
    }

    // ### Place Accidentals in Columns
    //
    // Default to a classic triangular layout (middle accidental farthest left),
    // but follow exceptions as outlined in G. Read's _Music Notation_ and
    // Elaine Gould's _Behind Bars_.
    //
    // Additionally, this implements different vertical colission rules for
    // flats (only need 2.5 lines clearance below) and double sharps (only
    // need 2.5 lines of clearance above or below).
    //
    // Classic layouts and exception patterns are found in the 'tables.js'
    // in 'Vex.Flow.accidentalColumnsTable'
    //
    // Beyond 6 vertical accidentals, default to the parallel ascending lines approach,
    // using as few columns as possible for the verticle structure.
    //
    // TODO (?): Allow column to be specified for an accidental at run-time?

    var total_columns = 0;

    // establish the boundaries for a group of notes with clashing accidentals:
    for(i = 0; i<line_list.length; i++) {
      var no_further_conflicts = false;
      var group_start = i;
      var group_end = i;

      group_check_while : while( (group_end+1 < line_list.length) && (!no_further_conflicts) ) {
        // if this note conflicts with the next:
        if(this.checkCollision(line_list[group_end], line_list[group_end + 1])) {
        // include the next note in the group:
          group_end++;
        }
        else no_further_conflicts = true;
      }

      // Set columns for the lines in this group:
      var group_length = group_end - group_start + 1;

      // Set the accidental column for each line of the group
      var end_case = (this.checkCollision(line_list[group_start], line_list[group_end])) ? "a" : "b";


        var checkCollision = this.checkCollision;
        switch(group_length) {
          case 3:
            if( (end_case == "a") &&
                (line_list[group_start+1].line - line_list[group_start+2].line == 0.5) &&
                (line_list[group_start].line - line_list[group_start + 1].line != 0.5) )
              end_case = "second_on_bottom";
              break;
          case 4:
            if( (!checkCollision(line_list[group_start], line_list[group_start+2])) &&
                (!checkCollision(line_list[group_start+1], line_list[group_start+3])) )
              end_case = "spaced_out_tetrachord";
              break;
          case 5:
            if( (end_case == "b") &&
                (!checkCollision(line_list[group_start+1], line_list[group_start+3])) )
              end_case = "spaced_out_pentachord";
            if( (end_case == "spaced_out_pentachord") &&
                (!checkCollision(line_list[group_start], line_list[group_start+2])) &&
                (!checkCollision(line_list[group_start+2], line_list[group_start+4])) )
              end_case = "very_spaced_out_pentachord";
              break;
          case 6:
            if( (!checkCollision(line_list[group_start], line_list[group_start+3])) &&
                (!checkCollision(line_list[group_start+1], line_list[group_start+4])) &&
                (!checkCollision(line_list[group_start+2], line_list[group_start+5])) )
              end_case = "spaced_out_hexachord";
            if( (!checkCollision(line_list[group_start], line_list[group_start+2])) &&
                (!checkCollision(line_list[group_start+2], line_list[group_start+4])) &&
                (!checkCollision(line_list[group_start+1], line_list[group_start+3])) &&
                (!checkCollision(line_list[group_start+3], line_list[group_start+5])) )
              end_case = "very_spaced_out_hexachord";
              break;
        }

      var group_member;
      var column;
      // If the group contains more than seven members, use ascending parallel lines
      // of accidentals, using as few columns as possible while avoiding collisions.
      if (group_length>=7) {
        // First, determine how many columns to use:
        var pattern_length = 2;
        var colission_detected = true;
        while(colission_detected === true) {
          colission_detected = false;
          colission_detecter : for(var line = 0; line + pattern_length < line_list.length; line++) {
            if(this.checkCollision(line_list[line], line_list[line+pattern_length])) {
              colission_detected = true;
              pattern_length++;
              break colission_detecter;
            }
          }
        }
        // Then, assign a column to each line of accidentals
        for(group_member = i; group_member <= group_end; group_member++) {
          column = ((group_member-i) % pattern_length) + 1;
          line_list[group_member].column = column;
          total_columns = (total_columns > column) ? total_columns : column;
        }

      // Otherwise, if the group contains fewer than seven members, use the layouts from
      // the accidentalsColumnsTable housed in tables.js.
      } else {
        for(group_member = i; group_member <= group_end; group_member++) {
          column = Vex.Flow.accidentalColumnsTable[group_length][end_case][group_member-i];
          line_list[group_member].column = column;
          total_columns = (total_columns > column) ? total_columns : column;
        }
      }

      // Increment i to the last note that was set, so that if a lower set of notes
      // does not conflict at all with this group, it can have its own classic shape.
      i = group_end;
    }

    // ### Convert Columns to x_offsets
    //
    // This keeps columns aligned, even if they have different accidentals within them
    // which sometimes results in a larger x_offset than is an accidental might need
    // to preserve the symmetry of the accidental shape.
    //
    // Neither A.C. Vinci nor G. Read address this, and it typically only happens in
    // music with complex chord clusters.
    //
    // TODO (?): Optionally allow closer compression of accidentals, instead of forcing
    // parallel columns.

    // track each column's max width, which will be used as initial shift of later columns:
    var column_widths = [];
    var column_x_offsets = [];
    for(i=0; i<=total_columns; i++) {
      column_widths[i] = 0;
      column_x_offsets[i] = 0;
    }

    column_widths[0] = acc_shift + left_shift;
    column_x_offsets[0] = acc_shift + left_shift;

    // Fill column_widths with widest needed x-space;
    // this is what keeps the columns parallel.
    line_list.forEach(function(line) {
      if(line.width > column_widths[line.column]) column_widths[line.column] = line.width;
    });

    for(i=1; i<column_widths.length; i++) {
      // this column's offset = this column's width + previous column's offset
      column_x_offsets[i] = column_widths[i] + column_x_offsets[i-1];
    }

    var total_shift = column_x_offsets[column_x_offsets.length-1];
    // Set the x_shift for each accidental according to column offsets:
    var acc_count = 0;
    line_list.forEach(function(line) {
      var line_width = 0;
      var last_acc_on_line = acc_count + line.num_acc;
      // handle all of the accidentals on a given line:
      for(acc_count; acc_count<last_acc_on_line; acc_count++) {
        var x_shift = (column_x_offsets[line.column-1] + line_width);
        acc_list[acc_count].acc.setXShift(x_shift);
        // keep track of the width of accidentals we've added so far, so that when
        // we loop, we add space for them.
        line_width += acc_list[acc_count].acc.getWidth() + accidental_spacing;
        L("Line, acc_count, shift: ", line.line, acc_count, x_shift);
      }
    });

    // update the overall layout with the full width of the accidental shapes:
    state.left_shift += total_shift;
  };

  // Helper function to determine whether two lines of accidentals collide vertically
  Accidental.checkCollision = function(line_1, line_2) {
    var clearance = line_2.line - line_1.line;
    var clearance_required = 3;
    // But less clearance is required for certain accidentals: b, bb and ##.
    if(clearance>0) { // then line 2 is on top
      clearance_required = (line_2.flat_line || line_2.dbl_sharp_line) ? 2.5 : 3.0;
      if(line_1.dbl_sharp_line) clearance -= 0.5;
    } else { // line 1 is on top
      clearance_required = (line_1.flat_line || line_1.dbl_sharp_line) ? 2.5 : 3.0;
      if(line_2.dbl_sharp_line) clearance -= 0.5;
    }
    var colission = (Math.abs(clearance) < clearance_required);
    L("Line_1, Line_2, Collision: ", line_1.line, line_2.line, colission);
    return(colission);
  };

  // ## Prototype Methods
  //
  // An `Accidental` inherits from `Modifier`, and is formatted within a
  // `ModifierContext`.
  Vex.Inherit(Accidental, Modifier, {
    // Create accidental. `type` can be a value from the
    // `Vex.Flow.accidentalCodes.accidentals` table in `tables.js`. For
    // example: `#`, `##`, `b`, `n`, etc.
    init: function(type) {
      Accidental.superclass.init.call(this);
      L("New accidental: ", type);

      this.note = null;
      // The `index` points to a specific note in a chord.
      this.index = null;
      this.type = type;
      this.position = Modifier.Position.LEFT;

      this.render_options = {
        // Font size for glyphs
        font_scale: 38,

        // Length of stroke across heads above or below the stave.
        stroke_px: 3
      };

      this.accidental = Vex.Flow.accidentalCodes(this.type);
      if (!this.accidental) throw new Vex.RERR("ArgumentError", "Unknown accidental type: " + type);

      // Cautionary accidentals have parentheses around them
      this.cautionary = false;
      this.paren_left = null;
      this.paren_right = null;

      // Initial width is set from table.
      this.setWidth(this.accidental.width);
    },

    // Attach this accidental to `note`, which must be a `StaveNote`.
    setNote: function(note){
      if (!note) throw new Vex.RERR("ArgumentError", "Bad note value: " + note);
      this.note = note;

      // Accidentals attached to grace notes are rendered smaller.
      if (this.note.getCategory() === 'gracenotes') {
        this.render_options.font_scale = 25;
        this.setWidth(this.accidental.gracenote_width);
      }
    },

    // If called, draws parenthesis around accidental.
    setAsCautionary: function() {
      this.cautionary = true;
      this.render_options.font_scale = 28;
      this.paren_left = Vex.Flow.accidentalCodes("{");
      this.paren_right = Vex.Flow.accidentalCodes("}");
      var width_adjust = (this.type == "##" || this.type == "bb") ? 6 : 4;

      // Make sure `width` accomodates for parentheses.
      this.setWidth(this.paren_left.width + this.accidental.width + this.paren_right.width - width_adjust);
      return this;
    },

    // Render accidental onto canvas.
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw accidental without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw accidental without a note and index.");

      // Figure out the start `x` and `y` coordinates for this note and index.
      var start = this.note.getModifierStartXY(this.position, this.index);
      var acc_x = ((start.x + this.x_shift) - this.width);
      var acc_y = start.y + this.y_shift;
      L("Rendering: ", this.type, acc_x, acc_y);

      if (!this.cautionary) {
        // Render the accidental alone.
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.accidental.code);
      } else {
        // Render the accidental in parentheses.
        acc_x += 3;
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.paren_left.code);
        acc_x += 2;
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.accidental.code);
        acc_x += this.accidental.width - 2;
        if (this.type == "##" || this.type == "bb") acc_x -= 2;
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.paren_right.code);
      }
    }
  });

  // ## Static Methods
  //
  // Use this method to automatically apply accidentals to a set of `voices`.
  // The accidentals will be remembered between all the voices provided.
  // Optionally, you can also provide an initial `keySignature`.
  Accidental.applyAccidentals = function(voices, keySignature) {
    var tickPositions = [];
    var tickNoteMap = {};

    // Sort the tickables in each voice by their tick position in the voice
    voices.forEach(function(voice) {
      var tickPosition = new Vex.Flow.Fraction(0, 1);
      var notes = voice.getTickables();
      notes.forEach(function(note) {
        var notesAtPosition = tickNoteMap[tickPosition.value()];

        if (!notesAtPosition) {
          tickPositions.push(tickPosition.value());
          tickNoteMap[tickPosition.value()] = [note];
        } else {
          notesAtPosition.push(note);
        }

        tickPosition.add(note.getTicks());
      });
    });

    var music = new Vex.Flow.Music();

    // Default key signature is C major
    if (!keySignature) keySignature = "C";

    // Get the scale map, which represents the current state of each pitch
    var scaleMap = music.createScaleMap(keySignature);

    tickPositions.forEach(function(tick) {
      var notes = tickNoteMap[tick];

      // Array to store all pitches that modified accidental states
      // at this tick position
      var modifiedPitches = [];

      notes.forEach(function(note) {
          if (note.isRest()) return;

          // Go through each key and determine if an accidental should be
          // applied
          note.keys.forEach(function(keyString, keyIndex) {
              var key = music.getNoteParts(keyString.split('/')[0]);

              // Force a natural for every key without an accidental
              var accidentalString = key.accidental || "n";
              var pitch = key.root + accidentalString;

              // Determine if the current pitch has the same accidental
              // as the scale state
              var sameAccidental = scaleMap[key.root] === pitch;

              // Determine if an identical pitch in the chord already
              // modified the accidental state
              var previouslyModified = modifiedPitches.indexOf(pitch) > -1;

              // Add the accidental to the StaveNote
              if (!sameAccidental || (sameAccidental && previouslyModified)) {
                  // Modify the scale map so that the root pitch has an
                  // updated state
                  scaleMap[key.root] = pitch;

                  // Create the accidental
                  var accidental = new Vex.Flow.Accidental(accidentalString);

                  // Attach the accidental to the StaveNote
                  note.addAccidental(keyIndex, accidental);

                  // Add the pitch to list of pitches that modified accidentals
                  modifiedPitches.push(pitch);
              }
          });
      });
    });
  };

  return Accidental;
}());
