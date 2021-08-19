// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { BoundingBox } from './boundingbox';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';

export interface GlyphNoteOptions {
  ignoreTicks?: boolean;
  line?: number;
}

export class GlyphNote extends Note {
  protected options: GlyphNoteOptions;

  constructor(glyph: Glyph | undefined, noteStruct: NoteStruct, options?: GlyphNoteOptions) {
    super(noteStruct);
    this.options = {
      ignoreTicks: false,
      line: 2,
      ...options,
    };
    this.setAttribute('type', 'GlyphNote');

    // Note properties
    this.ignore_ticks = this.options.ignoreTicks as boolean;
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
    if (!this.glyph.getContext()) {
      this.glyph.setContext(ctx);
    }

    this.glyph.setStave(stave);
    this.glyph.setYShift(stave.getYForLine(this.options.line as number) - stave.getYForGlyphs());

    const x = this.isCenterAligned() ? this.getAbsoluteX() - this.getWidth() / 2 : this.getAbsoluteX();
    this.glyph.renderToStave(x);
    this.drawModifiers();
    ctx.closeGroup();
  }
}
