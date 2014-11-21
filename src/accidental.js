// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
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

    if (!accidentals || accidentals.length === 0) return false;

    var acc_list = [];
    var hasStave = false;
    var prev_note = null;
    var shiftL = 0;

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
      if (stave != null) {
        hasStave = true;
        var line_space = stave.options.spacing_between_lines_px;
        var y = stave.getYForLine(props.line);
        acc_list.push({ y: y, shift: shiftL, acc: acc, lineSpace: line_space });
      } else {
        acc_list.push({ line: props.line, shift: shiftL, acc: acc });
      }
    }

    // If stave assigned, format based on note y-position
    if (hasStave) return Accidental.formatByY(acc_list, state);

    // Sort accidentals by line number.
    acc_list.sort(function(a, b) { return (b.line - a.line); });

    // If first note left shift in case it is displaced
    var acc_shift = acc_list[0].shift;
    var x_width = 0;
    var top_line = acc_list[0].line;
    for (i = 0; i < acc_list.length; ++i) {
      acc = acc_list[i].acc;
      var line = acc_list[i].line;
      var shift = acc_list[i].shift;

      // Once you hit three stave lines, you can reset the position of the
      // accidental.
      if (line < top_line - 3.0) {
        top_line = line;
        acc_shift = shift;
      }

      acc.setXShift(left_shift + acc_shift);
      acc_shift += acc.getWidth() + accidental_spacing; // spacing
      x_width = (acc_shift > x_width) ? acc_shift : x_width;
    }

    state.left_shift += x_width;
  }

  Accidental.formatByY = function(acc_list, state) {
    var left_shift = state.left_shift;
    var accidental_spacing = 2;

    // Sort accidentals by Y-position.
    acc_list.sort(function(a, b) { return (b.y - a.y); });

    // If first note is displaced, get the correct left shift
    var acc_shift = acc_list[0].shift;
    var x_width = 0;
    var top_y = acc_list[0].y;

    for (var i = 0; i < acc_list.length; ++i) {
      var acc = acc_list[i].acc;
      var y = acc_list[i].y;
      var shift = acc_list[i].shift;

      // Once you hit three stave lines, you can reset the position of the
      // accidental.
      if (top_y - y > 3 * acc_list[i].lineSpace) {
        top_y = y;
        acc_shift = shift;
      }

      acc.setXShift(acc_shift + left_shift);
      acc_shift += acc.getWidth() + accidental_spacing; // spacing
      x_width = (acc_shift > x_width) ? acc_shift : x_width;
    }

    state.left_shift += x_width;
  },

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
      var acc_x = (start.x + this.x_shift) - this.width;
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