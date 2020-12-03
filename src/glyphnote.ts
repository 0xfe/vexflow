// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import {Note} from './note';
import {Glyph} from "./glyph";
import {IStaveNoteStruct} from "./types/note";
import {BoundingBox} from "./boundingbox";
import {IGlyphNoteOptions} from "./types/glyphnote";

export class GlyphNote extends Note {
  private options: IGlyphNoteOptions;

  constructor(glyph: Glyph, noteStruct: IStaveNoteStruct, options: IGlyphNoteOptions) {
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

  setGlyph(glyph: Glyph): this {
    this.glyph = glyph;
    this.setWidth(this.glyph.getMetrics().width);
    return this;
  }

  getBoundingBox(): BoundingBox {
    return (this.glyph as Glyph).getBoundingBox();
  }

  /*
  addToModifierContext() {
    return this;
  }
  */

  preFormat(): this {
    this.setPreFormatted(true);
    return this;
  }

  draw(): void {
    this.stave.checkContext();
    this.setRendered();

    // Context is set when setStave is called on Note
    if (!(this.glyph as Glyph).getContext()) {
      (this.glyph as Glyph).setContext(this.context);
    }

    (this.glyph as Glyph).setStave(this.stave);
    (this.glyph as Glyph).setYShift(this.stave.getYForLine(this.options.line) - this.stave.getYForGlyphs());

    const x = this.isCenterAligned() ? this.getAbsoluteX() - (this.getWidth() / 2) : this.getAbsoluteX();
    (this.glyph as Glyph).renderToStave(x);
  }
}
