// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
// MIT License

import { Clef, ClefType } from './clef';
import { Glyph } from './glyph';
import { GlyphNote } from './glyphnote';
import { Category } from './typeguard';

/** ClefNote implements clef annotations in measures. */
export class ClefNote extends GlyphNote {
  static get CATEGORY(): string {
    return Category.ClefNote;
  }

  protected clef: Clef;
  protected type: string;

  constructor(type: string, size?: string, annotation?: string) {
    const clef = new Clef(type, size, annotation);
    const glyph = new Glyph(clef.clef.code, clef.clef.point);
    super(glyph, { duration: 'b' });
    this.type = type;
    this.clef = clef;
    // Note properties
    this.ignore_ticks = true;
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size: string, annotation: string): this {
    this.type = type;
    this.clef = new Clef(type, size, annotation);
    return this.setGlyph(new Glyph(this.clef.clef.code, this.clef.clef.point));
  }

  /** Get associated clef. */
  getClef(): ClefType {
    return this.clef.clef;
  }

  /** Render clef note. */
  draw(): void {
    const stave = this.checkStave();
    if (!this.glyph.getContext()) {
      this.glyph.setContext(this.getContext());
    }

    this.setRendered();
    const abs_x = this.getAbsoluteX();

    this.glyph.setStave(stave);
    this.glyph.setYShift(stave.getYForLine(this.clef.clef.line ?? 0) - stave.getYForGlyphs());
    this.glyph.renderToStave(abs_x);

    // If the Vex.Flow.Clef has an annotation, such as 8va, draw it.
    if (this.clef.annotation !== undefined) {
      const attachment = new Glyph(this.clef.annotation.code, this.clef.annotation.point);
      if (!attachment.getContext()) {
        attachment.setContext(this.getContext());
      }
      attachment.setStave(stave);
      attachment.setYShift(stave.getYForLine(this.clef.annotation.line) - stave.getYForGlyphs());
      attachment.setXShift(this.clef.annotation.x_shift);
      attachment.renderToStave(abs_x);
    }
  }
}
