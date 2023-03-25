// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
// MIT License

import { Clef, ClefAnnotatiomType, ClefType } from './clef';
import { Glyph } from './glyph';
import { Note } from './note';
import { Category } from './typeguard';

/** ClefNote implements clef annotations in measures. */
export class ClefNote extends Note {
  static get CATEGORY(): string {
    return Category.ClefNote;
  }

  protected clef: ClefType;
  protected annotation?: ClefAnnotatiomType;
  protected type: string;
  protected size: string;

  constructor(type: string, size?: string, annotation?: string) {
    super({ duration: 'b' });
    this.type = type;
    const clef = new Clef(type, size, annotation);
    this.clef = clef.clef;
    this.annotation = clef.annotation;
    this.size = size === undefined ? 'default' : size;
    this.setWidth(Glyph.getWidth(this.clef.code, Clef.getPoint(this.size), `clefNote_${this.size}`));

    // Note properties
    this.ignore_ticks = true;
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size: string, annotation: string): this {
    this.type = type;
    this.size = size;
    const clef = new Clef(type, size, annotation);
    this.clef = clef.clef;
    this.annotation = clef.annotation;
    this.setWidth(Glyph.getWidth(this.clef.code, Clef.getPoint(this.size), `clefNote_${this.size}`));
    return this;
  }

  /** Get associated clef. */
  getClef(): ClefType {
    return this.clef;
  }

  preFormat(): this {
    this.preFormatted = true;
    return this;
  }

  /** Render clef note. */
  draw(): void {
    const stave = this.checkStave();
    const ctx = this.checkContext();

    this.setRendered();
    const abs_x = this.getAbsoluteX();

    Glyph.renderGlyph(ctx, abs_x, stave.getYForLine(this.clef.line), Clef.getPoint(this.size), this.clef.code, {
      category: `clefNote_${this.size}`,
    });

    // If the Vex.Flow.Clef has an annotation, such as 8va, draw it.
    if (this.annotation !== undefined) {
      const attachment = new Glyph(this.annotation.code, this.annotation.point);
      attachment.setContext(ctx);
      attachment.setStave(stave);
      attachment.setYShift(stave.getYForLine(this.annotation.line) - stave.getYForGlyphs());
      attachment.setXShift(this.annotation.x_shift);
      attachment.renderToStave(abs_x);
    }
  }
}
