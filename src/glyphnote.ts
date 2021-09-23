// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { BoundingBox } from './boundingbox';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';

export interface GlyphNoteOptions {
  ignoreTicks?: boolean;
  line?: number;
}

export class GlyphNote extends Note {
  static get CATEGORY(): string {
    return 'GlyphNote';
  }

  protected options: Required<GlyphNoteOptions>;

  constructor(glyph: Glyph | undefined, noteStruct: NoteStruct, options?: GlyphNoteOptions) {
    super(noteStruct);
    this.options = {
      ignoreTicks: false,
      line: 2,
      ...options,
    };

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
    return this.glyph.getBoundingBox();
  }

  preFormat(): this {
    if (!this.preFormatted && this.modifierContext) {
      this.modifierContext.preFormat();
    }
    this.setPreFormatted(true);
    return this;
  }

  drawModifiers(): void {
    const ctx = this.checkContext();
    ctx.openGroup('modifiers');
    for (let i = 0; i < this.modifiers.length; i++) {
      const modifier = this.modifiers[i];
      modifier.setContext(ctx);
      modifier.drawWithStyle();
    }
    ctx.closeGroup();
  }

  draw(): void {
    const stave = this.checkStave();
    const ctx = stave.checkContext();
    this.setRendered();
    ctx.openGroup('glyphNote', this.getAttribute('id'));

    // Context is set when setStave is called on Note
    const glyph = this.glyph;
    if (!glyph.getContext()) {
      glyph.setContext(ctx);
    }

    glyph.setStave(stave);
    glyph.setYShift(stave.getYForLine(this.options.line) - stave.getYForGlyphs());

    const x = this.isCenterAligned() ? this.getAbsoluteX() - this.getWidth() / 2 : this.getAbsoluteX();
    glyph.renderToStave(x);
    this.drawModifiers();
    ctx.closeGroup();
  }
}
