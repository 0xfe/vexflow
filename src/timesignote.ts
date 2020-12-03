// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import {Note} from './note';
import {TimeSignature} from './timesignature';
import {IStaveNoteStruct} from "./types/note";
import {BoundingBox} from "./boundingbox";
import {ITimeSignature} from "./types/timesignature";

export class TimeSigNote extends Note {
  private timeSig: ITimeSignature;

  constructor(timeSpec: string, customPadding?: number) {
    super({duration: 'b'} as IStaveNoteStruct);
    this.setAttribute('type', 'TimeSigNote');

    const timeSignature = new TimeSignature(timeSpec, customPadding);
    this.timeSig = timeSignature.getTimeSig();
    this.setWidth(this.timeSig.glyph.getMetrics().width);

    // Note properties
    this.ignore_ticks = true;
  }

  getBoundingBox(): BoundingBox {
    return super.getBoundingBox();
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
    this.stave.checkContext();
    this.setRendered();

    if (!this.timeSig.glyph.getContext()) {
      this.timeSig.glyph.setContext(this.context);
    }

    this.timeSig.glyph.setStave(this.stave);
    this.timeSig.glyph.setYShift(
      this.stave.getYForLine(this.timeSig.line) - this.stave.getYForGlyphs());
    this.timeSig.glyph.renderToStave(this.getAbsoluteX());
  }
}
