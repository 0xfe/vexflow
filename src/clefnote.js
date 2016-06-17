// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Copyright Mohit Muthanna 2010
//
// Author Taehoon Moon 2014

import { Vex } from './vex';
import { BoundingBox } from './boundingbox';
import { Note } from './note';
import { Clef } from './clef';
import { Glyph } from './glyph';

/** @constructor */
export var ClefNote = (function() {
  function ClefNote(type, size, annotation) { this.init(type, size, annotation); }

  Vex.Inherit(ClefNote, Note, {
    init: function(type, size, annotation) {
      ClefNote.superclass.init.call(this, {duration: "b"});

      this.setType(type, size, annotation);

      // Note properties
      this.ignore_ticks = true;
    },

    setType: function(type, size, annotation) {
      this.type = type;
      this.clef_obj = new Clef(type, size, annotation);
      this.clef = this.clef_obj.clef;
      this.glyph = new Glyph(this.clef.code, this.clef.point);
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
      var superclass = ClefNote.superclass;
      superclass.setStave.call(this, stave);
    },

    getBoundingBox: function() {
      return new BoundingBox(0, 0, 0, 0);
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
        var attachment = new Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
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
