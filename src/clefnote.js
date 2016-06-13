// Vex Flow Notation
// Copyright Mohit Muthanna 2010
//
// Author Taehoon Moon 2014

/** @constructor */
Vex.Flow.ClefNote = (function() {
  function ClefNote(type, size, annotation) { this.init(type, size, annotation); }

  Vex.Inherit(ClefNote, Vex.Flow.Note, {
    init: function(type, size, annotation) {
      ClefNote.superclass.init.call(this, {duration: "b"});

      this.setType(type, size, annotation);

      // Note properties
      this.ignore_ticks = true;
    },

    setType: function(type, size, annotation) {
      this.type = type;
      this.clef_obj = new Vex.Flow.Clef(type, size, annotation);
      this.clef = this.clef_obj.clef;
      this.glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.setWidth(this.glyph.getMetrics().width);
      return this;
    },

    getClef: function() {
      return this.clef;
    },

    setContext: function(context){
      this.context = context;
      this.glyph.setContext(this.context);
      return this;
    },

    setStave: function(stave) {
      var superclass = Vex.Flow.ClefNote.superclass;
      superclass.setStave.call(this, stave);
    },

    getBoundingBox: function() {
      return new Vex.Flow.BoundingBox(0, 0, 0, 0);
    },

    addToModifierContext: function() {
      /* overridden to ignore */
      return this;
    },

    getCategory: function() {
      return "clefnote";
    },

    preFormat: function() {
      this.setPreFormatted(true);
      return this;
    },

    draw: function() {
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

      if (!this.glyph.getContext()) {
        this.glyph.setContext(this.context);
      }
      var abs_x = this.getAbsoluteX();

      this.glyph.setStave(this.stave);
      this.glyph.setYShift(
        this.stave.getYForLine(this.clef.line) - this.stave.getYForGlyphs());
      this.glyph.renderToStave(abs_x);

      // If the Vex.Flow.Clef has an annotation, such as 8va, draw it.
      if (this.clef_obj.annotation !== undefined) {
        var attachment = new Vex.Flow.Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
        if (!attachment.getContext()) {
            attachment.setContext(this.context);
        }
        attachment.setStave(this.stave);
        attachment.setYShift(
          this.stave.getYForLine(this.clef_obj.annotation.line) - this.stave.getYForGlyphs());
        attachment.setXShift(this.clef_obj.annotation.x_shift);
        attachment.renderToStave(abs_x);
      }

    }
  });

  return ClefNote;
}());
