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
      Vex.Flow.Ornament.format(this.modifiers["ornaments"], this.state);
      Vex.Flow.Annotation.format(this.modifiers["annotations"], this.state);
      Vex.Flow.Bend.format(this.modifiers["bends"], this.state);
      Vex.Flow.Vibrato.format(this.modifiers["vibratos"], this.state, this);

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
