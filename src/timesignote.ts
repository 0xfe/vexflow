// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { Vex } from './vex';
import { Note } from './note';
import { TimeSignature, TimeSignatureInfo } from './timesignature';

export class TimeSigNote extends Note {
  protected timeSig?: TimeSignatureInfo;

  constructor(timeSpec: string, customPadding?: number) {
    super({ duration: 'b' });
    this.setAttribute('type', 'TimeSigNote');

    const timeSignature = new TimeSignature(timeSpec, customPadding);
    this.timeSig = timeSignature.getTimeSig();
    this.setWidth(this.timeSig?.glyph.getMetrics().width ?? 0);

    // Note properties
    this.ignore_ticks = true;
  }

  addToModifierContext(): this {
    /* overridden to ignore */
    return this;
  }

  preFormat(): this {
    this.setPreFormatted(true);
    return this;
  }

  draw(): void {
    if (!this.stave) throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    if (!this.timeSig) throw new Vex.RERR('NoTimeSignatureInfo', 'No TimeSignatureInfo attached to this note.');
    const ctx = this.checkContext();
    this.setRendered();

    if (!this.timeSig.glyph.getContext()) {
      this.timeSig.glyph.setContext(ctx);
    }

    this.timeSig.glyph.setStave(this.stave);
    this.timeSig.glyph.setYShift(this.stave.getYForLine(2) - this.stave.getYForGlyphs());
    this.timeSig.glyph.renderToStave(this.getAbsoluteX());
  }
}
