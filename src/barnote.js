// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.BarNote = (function() {
  function BarNote() { this.init(); }

  Vex.Inherit(BarNote, Vex.Flow.Note, {
    init: function() {
      BarNote.superclass.init.call(this, {duration: "b"});

      var TYPE = Vex.Flow.Barline.type;
      this.metrics = {
        widths: {}
      };

      this.metrics.widths[TYPE.SINGLE] = 8;
      this.metrics.widths[TYPE.DOUBLE] = 12;
      this.metrics.widths[TYPE.END] = 15;
      this.metrics.widths[TYPE.REPEAT_BEGIN] = 14;
      this.metrics.widths[TYPE.REPEAT_END] = 14;
      this.metrics.widths[TYPE.REPEAT_BOTH] = 18;
      this.metrics.widths[TYPE.NONE] = 0;

      // Note properties
      this.ignore_ticks = true;
      this.type = TYPE.SINGLE;
      this.setWidth(this.metrics.widths[this.type]);
    },

    setType: function(type) {
      this.type = type;
      this.setWidth(this.metrics.widths[this.type]);
      return this;
    },

    getType: function() {
      return this.type;
    },

    setStave: function(stave) {
      var superclass = Vex.Flow.BarNote.superclass;
      superclass.setStave.call(this, stave);
    },

    getBoundingBox: function() {
      return new Vex.Flow.BoundingBox(0, 0, 0, 0);
    },

    addToModifierContext: function() {
      /* overridden to ignore */
      return this;
    },

    preFormat: function() {
      this.setPreFormatted(true);
      return this;
    },

    draw: function() {
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
      var barline = new Vex.Flow.Barline(this.type, this.getAbsoluteX());
      barline.draw(this.stave, this.getAbsoluteX());
    }
  });

  return BarNote;
}());
