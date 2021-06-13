// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { Note } from './note';
import { TimeSignature, TimeSignatureInfo } from './timesignature';

export class TimeSigNote extends Note {
  protected timeSigInfo: TimeSignatureInfo;

  constructor(timeSpec: string, customPadding?: number) {
    super({ duration: 'b' });
    this.setAttribute('type', 'TimeSigNote');

    const timeSignature = new TimeSignature(timeSpec, customPadding);
    this.timeSigInfo = timeSignature.getInfo();
    this.setWidth(this.timeSigInfo.glyph.getMetrics().width);

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
    const ctx = this.checkContext();
    this.setRendered();

    if (!this.timeSigInfo.glyph.getContext()) {
      this.timeSigInfo.glyph.setContext(ctx);
    }

    this.timeSigInfo.glyph.setStave(stave);
    this.timeSigInfo.glyph.setYShift(stave.getYForLine(2) - stave.getYForGlyphs());
    this.timeSigInfo.glyph.renderToStave(this.getAbsoluteX());
  }
}
