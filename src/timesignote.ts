// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { RuntimeError } from './util';
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
    const stave = this.checkStave();
    if (!this.timeSig) throw new RuntimeError('NoTimeSignatureInfo', 'No TimeSignatureInfo attached to this note.');
    const ctx = this.checkContext();
    this.setRendered();

    if (!this.timeSig.glyph.getContext()) {
      this.timeSig.glyph.setContext(ctx);
    }

    this.timeSig.glyph.setStave(stave);
    this.timeSig.glyph.setYShift(stave.getYForLine(2) - stave.getYForGlyphs());
    this.timeSig.glyph.renderToStave(this.getAbsoluteX());
  }
}
