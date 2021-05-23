// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { BoundingBox } from './boundingbox';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';
import { ModifierContext } from './modifiercontext';
import { ModifierContextState } from './modifiercontext';

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

  // Add self to modifier context. `mContext` is the `ModifierContext`
  // to be added to.
  addToModifierContext(mContext: ModifierContext): this {
    this.modifierContext = mContext;
    for (let i = 0; i < this.modifiers.length; ++i) {
      this.modifierContext.addMember(this.modifiers[i]);
    }
    this.setPreFormatted(false);
    return this;
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
    if (!this.stave) {
      throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    }

    const ctx = this.stave.checkContext();
    this.setRendered();
    ctx.openGroup('glypheNote', this.getAttribute('id'));

    // Context is set when setStave is called on Note
    if (!this.glyph.getContext()) {
      this.glyph.setContext(ctx);
    }

    this.glyph.setStave(this.stave);
    this.glyph.setYShift(this.stave.getYForLine(this.options.line as number) - this.stave.getYForGlyphs());

    const x = this.isCenterAligned() ? this.getAbsoluteX() - this.getWidth() / 2 : this.getAbsoluteX();
    this.glyph.renderToStave(x);
    this.drawModifiers();
    ctx.closeGroup();
  }
}
