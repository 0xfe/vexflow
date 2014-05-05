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

  // To enable logging for this class. Set `Vex.Flow.Accidental.DEBUG` to `true`.
  function L() { if (Accidental.DEBUG) Vex.L("Vex.Flow.Accidental", arguments); }

  var Modifier = Vex.Flow.Modifier;

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

    // Return the modifier type. Used by the `ModifierContext` to calculate
    // layout.
    getCategory: function() { return "accidentals"; },

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
  
  // ## Private Helper
  // 
  // This is helper method for `Accidental.generateAccidentals()`. It's used to
  // create a scale map that represents the pitch state for a `keySignature`. 
  // For example, passing a `G` to `keySignature` would return a scale map 
  // with every note naturalized except for `F` which has an `F#` state.
  function createScaleMap(keySignature) {
    var music = new Vex.Flow.Music();
    var keySigParts = music.getKeyParts(keySignature);
    var scaleName = Vex.Flow.KeyManager.scales[keySigParts.type];

    var keySigString = keySigParts.root;
    if (keySigParts.accidental) keySigString += keySigParts.accidental;

    if (!scaleName) throw new Vex.RERR("BadArguments", "Unsupported key type: " + keySignature);

    var scale = music.getScaleTones(music.getNoteValue(keySigString), scaleName);
    var noteLocation = Vex.Flow.Music.root_indices[keySigParts.root];

    var scaleMap = {};
    for (var i = 0; i < Vex.Flow.Music.roots.length; ++i) {
      var index = (noteLocation + i) % Vex.Flow.Music.roots.length;
      var rootName = Vex.Flow.Music.roots[index];
      var noteName = music.getRelativeNoteName(rootName, scale[i]);

      if (noteName.length === 1) {
        noteName += "n";
      }

      scaleMap[rootName] = noteName;
    }

    return scaleMap;
  }

  // ## Static Methods
  // 
  // Use this method to automatically apply accidentals to a set of `voices`.
  // The accidentals will be remembered between all the voices provided.
  // Optionally, you can also provide an initial `keySignature`. 
  Accidental.generateAccidentals = function(voices, keySignature) {
    var tickPositions = [];
    var tickNoteMap = {};

    // Sort the tickables in each voice by their tick position in the voice
    voices.forEach(function(voice) {
      var tickPosition = 0;
      var notes = voice.getTickables();
      notes.forEach(function(note) {
        var notesAtPosition = tickNoteMap[tickPosition];

        if (!notesAtPosition) {
          tickPositions.push(tickPosition);
          tickNoteMap[tickPosition] = [note];
        } else {
          notesAtPosition.push(note);
        }

        tickPosition += note.getTicks().value();
      });
    });
    
    var music = new Vex.Flow.Music();

    // Default key signature is C major
    if (!keySignature) keySignature = "C";

    // Get the scale map, which represents the current state of each pitch
    var scaleMap = createScaleMap(keySignature);

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