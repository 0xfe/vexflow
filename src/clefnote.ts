// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
// MIT License

import { Clef, ClefType } from './clef';
import { Glyph } from './glyph';
import { Note } from './note';
import { RenderContext } from './rendercontext';
import { Category } from './typeguard';

/** ClefNote implements clef annotations in measures. */
export class ClefNote extends Note {
  static get CATEGORY(): string {
    return Category.ClefNote;
  }

  protected glyph: Glyph;
  protected clef: Clef;
  protected type: string;

  constructor(type: string, size?: string, annotation?: string) {
    super({ duration: 'b' });
    this.type = type;
    this.clef = new Clef(type, size, annotation);
    this.glyph = new Glyph(this.clef.clef.code, this.clef.clef.point);
    this.setWidth(this.glyph.getMetrics().width);

    // Note properties
    this.ignore_ticks = true;
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size: string, annotation: string): this {
    this.type = type;
    this.clef = new Clef(type, size, annotation);
    this.glyph = new Glyph(this.clef.clef.code, this.clef.clef.point);
    this.setWidth(this.glyph.getMetrics().width);
    return this;
  }

  /** Get associated clef. */
  getClef(): ClefType {
    return this.clef.clef;
  }

  /** Set associated context. */
  setContext(context: RenderContext): this {
    super.setContext(context);
    this.glyph.setContext(this.getContext());
    return this;
  }

  preFormat(): this {
    this.preFormatted = true;
    return this;
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
