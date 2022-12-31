// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { ModifierContext } from './modifiercontext';
import { Note } from './note';
import { TimeSignature } from './timesignature';
import { Category } from './typeguard';

export class TimeSigNote extends Note {
  static get CATEGORY(): string {
    return Category.TimeSigNote;
  }

  protected timeSig: TimeSignature;

  constructor(timeSpec: string, customPadding?: number) {
    super({ duration: 'b' });

    this.timeSig = new TimeSignature(timeSpec, customPadding);
    this.setWidth(this.timeSig.getGlyph().getMetrics().width);

    // Note properties
    this.ignore_ticks = true;
  }

  /* Overridden to ignore */
  // eslint-disable-next-line
  addToModifierContext(mc: ModifierContext): this {
    // DO NOTHING.
    return this;
  }

  preFormat(): this {
    this.preFormatted = true;
    return this;
  }

  draw(): void {
    const stave = this.checkStave();
    const ctx = this.checkContext();
    this.setRendered();

    const tsGlyph = this.timeSig.getGlyph();
    if (!tsGlyph.getContext()) {
      tsGlyph.setContext(ctx);
    }

    tsGlyph.setStave(stave);
    tsGlyph.setYShift(stave.getYForLine(2) - stave.getYForGlyphs());
    tsGlyph.renderToStave(this.getAbsoluteX());
  }
}
