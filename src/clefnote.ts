// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
// MIT License

import { Note } from './note';
import { Clef } from './clef';
import { Glyph } from './glyph';
import { BoundingBox } from './boundingbox';
import { ClefType } from './clef';
import { ModifierContext } from './modifiercontext';
import { RenderContext } from './rendercontext';

/** ClefNote implements clef annotations in measures. */
export class ClefNote extends Note {
  static get CATEGORY(): string {
    return 'ClefNote';
  }

  protected clef_obj: Clef;
  protected type: string;
  protected clef: ClefType;

  constructor(type: string, size?: string, annotation?: string) {
    super({ duration: 'b' });

    this.type = type;
    this.clef_obj = new Clef(type, size, annotation);
    this.clef = this.clef_obj.clef;
    this.glyph = new Glyph(this.clef.code, this.clef.point);
    this.setWidth(this.glyph.getMetrics().width);

    // Note properties
    this.ignore_ticks = true;
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size: string, annotation: string): this {
    this.type = type;
    this.clef_obj = new Clef(type, size, annotation);
    this.clef = this.clef_obj.clef;
    this.glyph = new Glyph(this.clef.code, this.clef.point);
    this.setWidth(this.glyph.getMetrics().width);
    return this;
  }

  /** Get associated clef. */
  getClef(): ClefType {
    return this.clef;
  }

  /** Set associated context. */
  setContext(context: RenderContext): this {
    super.setContext(context);
    this.glyph.setContext(this.getContext());
    return this;
  }

  /** Get bounding box. */
  getBoundingBox(): BoundingBox | undefined {
    return super.getBoundingBox();
  }

  /* Overridden to ignore */
  // eslint-disable-next-line
  addToModifierContext(mc: ModifierContext): this {
    // DO NOTHING.
    return this;
  }

  /** Set preformatted. */
  preFormat(): this {
    this.setPreFormatted(true);
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
    this.glyph.setYShift(stave.getYForLine(this.clef.line ?? 0) - stave.getYForGlyphs());
    this.glyph.renderToStave(abs_x);

    // If the Vex.Flow.Clef has an annotation, such as 8va, draw it.
    if (this.clef_obj.annotation !== undefined) {
      const attachment = new Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
      if (!attachment.getContext()) {
        attachment.setContext(this.getContext());
      }
      attachment.setStave(stave);
      attachment.setYShift(stave.getYForLine(this.clef_obj.annotation.line) - stave.getYForGlyphs());
      attachment.setXShift(this.clef_obj.annotation.x_shift);
      attachment.renderToStave(abs_x);
    }
  }
}
