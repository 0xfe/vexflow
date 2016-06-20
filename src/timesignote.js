// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { Vex } from './vex';
import { BoundingBox } from './boundingbox';
import { Note } from './note';
import { TimeSignature } from './timesignature';

export class TimeSigNote extends Note {
  constructor(timeSpec, customPadding) {
    super({ duration: 'b' });

    var timeSignature = new TimeSignature(timeSpec, customPadding);
    this.timeSig = timeSignature.getTimeSig();
    this.setWidth(this.timeSig.glyph.getMetrics().width);

    // Note properties
    this.ignore_ticks = true;
  }

  getBoundingBox() {
    return new BoundingBox(0, 0, 0, 0);
  }

  addToModifierContext() {
    /* overridden to ignore */
    return this;
  }

  preFormat() {
    this.setPreFormatted(true);
    return this;
  }

  draw() {
    if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

    if (!this.timeSig.glyph.getContext()) {
      this.timeSig.glyph.setContext(this.context);
    }

    this.timeSig.glyph.setStave(this.stave);
    this.timeSig.glyph.setYShift(
      this.stave.getYForLine(this.timeSig.line) - this.stave.getYForGlyphs());
    this.timeSig.glyph.renderToStave(this.getAbsoluteX());
  }
}
