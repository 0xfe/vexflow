// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.GhostNote = (function() {
  function GhostNote(duration) {
    if (arguments.length > 0) this.init(duration);
  }

  Vex.Inherit(GhostNote, Vex.Flow.StemmableNote, {
    init: function(parameter) {
      // Sanity check
      if (!parameter) {
        throw new Vex.RuntimeError("BadArguments",
            "Ghost note must have valid initialization data to identify " +
            "duration.");
      }

      var note_struct;

      // Preserve backwards-compatibility
      if (typeof(parameter) === "string") {
        note_struct = { duration: parameter };
      } else if (typeof(parameter) === "object") {
        note_struct = parameter;
      } else {
        throw new Vex.RuntimeError("BadArguments",
            "Ghost note must have valid initialization data to identify " +
            "duration.");
      }

      GhostNote.superclass.init.call(this, note_struct);

      // Note properties
      this.setWidth(0);
    },

    isRest: function() { return true; },

    setStave: function(stave) { GhostNote.superclass.setStave.call(this, stave); },

    addToModifierContext: function()
      { /* intentionally overridden */ return this; },

    preFormat: function() {
      this.setPreFormatted(true);
      return this;
    },

    draw: function() {
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

      // Draw the modifiers
      for (var i = 0; i < this.modifiers.length; ++i) {
        var modifier = this.modifiers[i];
        modifier.setContext(this.context);
        modifier.draw();
      }
    }
  });

  return GhostNote;
}());
