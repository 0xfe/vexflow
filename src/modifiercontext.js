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
      text_line: 0,
      top_text_line: 0
    };

    // Add new modifiers to this array. The ordering is significant -- lower
    // modifiers are formatted and rendered before higher ones.
    this.PREFORMAT = [
      Vex.Flow.StaveNote,
      Vex.Flow.Dot,
      Vex.Flow.FretHandFinger,
      Vex.Flow.Accidental,
      Vex.Flow.GraceNoteGroup,
      Vex.Flow.Stroke,
      Vex.Flow.StringNumber,
      Vex.Flow.Articulation,
      Vex.Flow.Ornament,
      Vex.Flow.Annotation,
      Vex.Flow.Bend,
      Vex.Flow.Vibrato
    ];

    // If post-formatting is required for an element, add it to this array.
    this.POSTFORMAT = [ Vex.Flow.StaveNote ];
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

    preFormat: function() {
      if (this.preFormatted) return;
      this.PREFORMAT.forEach(function(modifier) {
        L("Preformatting ModifierContext: ", modifier.CATEGORY);
        modifier.format(this.getModifiers(modifier.CATEGORY), this.state, this);
      }, this);

      // Update width of this modifier context
      this.width = this.state.left_shift + this.state.right_shift;
      this.preFormatted = true;
    },

    postFormat: function() {
      if (this.postFormatted) return;
      this.POSTFORMAT.forEach(function(modifier) {
        L("Postformatting ModifierContext: ", modifier.CATEGORY);
        modifier.postFormat(this.getModifiers(modifier.CATEGORY), this);
      }, this);
    }
  };

  return ModifierContext;
}());
