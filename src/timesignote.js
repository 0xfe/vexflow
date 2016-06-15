// Vex Flow Notation
// Copyright Mohit Muthanna 2010
//
// Author Taehoon Moon 2014
import { Vex } from './vex';
import { BoundingBox } from './boundingbox';
import { Note } from './note';
import { TimeSignature } from './timesignature';
/** @constructor */
export var TimeSigNote = (function() {
  function TimeSigNote(timeSpec, customPadding) {
    if (arguments.length > 0) this.init(timeSpec, customPadding);
  }

  Vex.Inherit(TimeSigNote, Note, {
    init: function(timeSpec, customPadding) {
      TimeSigNote.superclass.init.call(this, {duration: "b"});

      var timeSignature = new TimeSignature(timeSpec, customPadding);
      this.timeSig = timeSignature.getTimeSig();
      this.setWidth(this.timeSig.glyph.getMetrics().width);

      // Note properties
      this.ignore_ticks = true;
    },

    setStave: function(stave) {
      var superclass = TimeSigNote.superclass;
      superclass.setStave.call(this, stave);
    },

    getBoundingBox: function() {
      return new BoundingBox(0, 0, 0, 0);
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

      if (!this.timeSig.glyph.getContext()) {
        this.timeSig.glyph.setContext(this.context);
      }

      this.timeSig.glyph.setStave(this.stave);
      this.timeSig.glyph.setYShift(
        this.stave.getYForLine(this.timeSig.line) - this.stave.getYForGlyphs());
      this.timeSig.glyph.renderToStave(this.getAbsoluteX());
    }
  });

  return TimeSigNote;
}());
