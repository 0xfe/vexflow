// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Note } from './note';

export class GlyphNote extends Note {
  constructor(glyph, noteStruct, options) {
    super(noteStruct);
    this.options = {
      ignoreTicks: false,
      line: 2,
      ...options
    };
    this.setAttribute('type', 'GlyphNote');

    // Note properties
    this.ignore_ticks = this.options.ignoreTicks;
    if (glyph) {
      this.setGlyph(glyph);
    }
  }

  setGlyph(glyph) {
    this.glyph = glyph;
    this.setWidth(this.glyph.getMetrics().width);
    return this;
  }

  getBoundingBox() {
    return this.glyph.getBoundingBox();
  }

  /*
  addToModifierContext() {
    return this;
  }
  */

  preFormat() {
    this.setPreFormatted(true);
    return this;
  }

  draw() {
    this.stave.checkContext();
    this.setRendered();

    // Context is set when setStave is called on Note
    if (!this.glyph.getContext()) {
      this.glyph.setContext(this.context);
    }

    this.glyph.setStave(this.stave);
    this.glyph.setYShift(this.stave.getYForLine(this.options.line) - this.stave.getYForGlyphs());

    const x = this.isCenterAligned() ? this.getAbsoluteX() - (this.getWidth() / 2) : this.getAbsoluteX();
    this.glyph.renderToStave(x);
  }
}
