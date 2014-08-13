// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of modifiers to notes (e.g. bends,
// fingering positions etc.)

Vex.Flow.ModifierContext = (function() {
  function ModifierContext() {
    // Current modifiers
    this.modifiers = {};

    // Formatting data.
    this.preFormatted = false;
    this.postFormatted = false;
    this.width = 0;
    this.spacing = 0;
    this.state = {
      left_shift: 0,
      right_shift: 0,
      text_line: 0
    };
  }

  // To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
  function L() { if (ModifierContext.DEBUG) Vex.L("Vex.Flow.ModifierContext", arguments); }

  ModifierContext.prototype = {
    addModifier: function(modifier) {
      var type = modifier.getCategory();
      if (!this.modifiers[type]) this.modifiers[type] = [];
      this.modifiers[type].push(modifier);
      modifier.setModifierContext(this);
      this.preFormatted = false;
      return this;
    },

    getModifiers: function(type) { return this.modifiers[type]; },
    getWidth: function() { return this.width; },
    getExtraLeftPx: function() { return this.state.left_shift; },
    getExtraRightPx: function() { return this.state.right_shift; },
    getState: function() { return this.state; },

    getMetrics: function() {
      if (!this.formatted) throw new Vex.RERR("UnformattedModifier",
          "Unformatted modifier has no metrics.");

      return {
        width: this.state.left_shift + this.state.right_shift + this.spacing,
        spacing: this.spacing,
        extra_left_px: this.state.left_shift,
        extra_right_px: this.state.right_shift
      };
    },

    formatBends: function() {
      var bends = this.modifiers['bends'];
      if (!bends || bends.length === 0) return this;

      var last_width = 0;
      var text_line = this.state.text_line;

      // Format Bends
      for (var i = 0; i < bends.length; ++i) {
        var bend = bends[i];
        bend.setXShift(last_width);
        last_width = bend.getWidth();
        bend.setTextLine(text_line);
      }

      this.state.right_shift += last_width;
      this.state.text_line += 1;
      return this;
    },

    formatVibratos: function() {
      var vibratos = this.modifiers['vibratos'];
      if (!vibratos || vibratos.length === 0) return this;

      var text_line = this.state.text_line;
      var width = 0;
      var shift = this.state.right_shift - 7;

      // If there's a bend, drop the text line
      var bends = this.modifiers['bends'];
      if (bends && bends.length > 0) {
        text_line--;
      }

      // Format Vibratos
      for (var i = 0; i < vibratos.length; ++i) {
        var vibrato = vibratos[i];
        vibrato.setXShift(shift);
        vibrato.setTextLine(text_line);
        width += vibrato.getWidth();
        shift += width;
      }

      this.state.right_shift += width;
      this.state.text_line += 1;
      return this;
    },

    formatAnnotations: function() {
      var annotations = this.modifiers['annotations'];
      if (!annotations || annotations.length === 0) return this;

      var text_line = this.state.text_line;
      var max_width = 0;

      // Format Annotations
      var width;
      for (var i = 0; i < annotations.length; ++i) {
        var annotation = annotations[i];
        annotation.setTextLine(text_line);
        width = annotation.getWidth() > max_width ?
          annotation.getWidth() : max_width;
        text_line++;
      }

      this.state.left_shift += width / 2;
      this.state.right_shift += width / 2;
      // No need to update text_line because we leave lots of room on the same
      // line.
      return this;
    },

    formatOrnaments: function() {
      var ornaments = this.modifiers['ornaments'];
      if (!ornaments || ornaments.length === 0) return this;

      var text_line = this.state.text_line;
      var max_width = 0;

      // Format Articulations
      var width;
      for (var i = 0; i < ornaments.length; ++i) {
        var ornament = ornaments[i];
        ornament.setTextLine(text_line);
        width = ornament.getWidth() > max_width ?
          ornament.getWidth() : max_width;

        var type = Vex.Flow.ornamentCodes(ornament.type);
        if(type.between_lines)
          text_line += 1;
        else
          text_line += 1.5;
      }

      this.state.left_shift += width / 2;
      this.state.right_shift += width / 2;
      this.state.text_line = text_line;
      return this;
    },

    postFormatNotes: function() {
      var notes = this.modifiers['stavenotes'];

      if (!notes) return;

      notes.forEach(function(note) {
        note.postFormat();
      });

      return this;
    },

    preFormat: function() {
      if (this.preFormatted) return;
      L("Preformatting ModifierContext");

      // Format modifiers in the following order:
      Vex.Flow.StaveNote.format(this.modifiers["stavenotes"], this.state);
      Vex.Flow.Dot.format(this.modifiers["dots"], this.state);
      Vex.Flow.FretHandFinger.format(this.modifiers["frethandfinger"], this.state);
      Vex.Flow.Accidental.format(this.modifiers["accidentals"], this.state);
      Vex.Flow.GraceNoteGroup.format(this.modifiers["gracenotegroups"], this.state);
      Vex.Flow.Stroke.format(this.modifiers["strokes"], this.state);
      Vex.Flow.StringNumber.format(this.modifiers["stringnumber"], this.state);
      Vex.Flow.Articulation.format(this.modifiers["articulations"], this.state);


           this.formatOrnaments().
           formatAnnotations().
           formatBends().
           formatVibratos();

      // Update width of this modifier context
      this.width = this.state.left_shift + this.state.right_shift;
      this.preFormatted = true;
    },

    postFormat: function() {
      if (this.postFormatted) return;

      this.postFormatNotes();
      return this;
    }
  };

  return ModifierContext;
}());
