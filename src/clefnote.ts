// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Copyright Mohit Muthanna 2010
//
// Author Taehoon Moon 2014
import {Note} from './note';
import {Clef} from './clef';
import {Glyph} from './glyph';
import {DrawContext} from "./types/common";
import {IClefType} from "./types/clef";
import {IStaveNoteStruct} from "./types/note";
import {BoundingBox} from "./boundingbox";
import {RuntimeError} from "./runtimeerror";

/** @constructor */
export class ClefNote extends Note {
  private clef_obj: Clef;
  private type: string;
  private clef: IClefType;

  static get CATEGORY(): string {
    return 'clefnote';
  }

  constructor(type: string, size: string, annotation: string) {
    super({duration: 'b'} as IStaveNoteStruct);
    this.setAttribute('type', 'ClefNote');

    this.setType(type, size, annotation);

    // Note properties
    this.ignore_ticks = true;
  }

  setType(type: string, size: string, annotation: string): this {
    this.type = type;
    this.clef_obj = new Clef(type, size, annotation);
    this.clef = this.clef_obj.clef;
    this.glyph = new Glyph(this.clef.code, this.clef.point);
    this.setWidth(this.glyph.getMetrics().width);
    return this;
  }

  getClef(): IClefType {
    return this.clef;
  }

  setContext(context: DrawContext): this {
    this.context = context;
    (this.glyph as Glyph).setContext(this.context);
    return this;
  }

  getBoundingBox(): BoundingBox {
    return super.getBoundingBox();
  }

  addToModifierContext(): this {
    /* overridden to ignore */
    return this;
  }

  getCategory(): string {
    return ClefNote.CATEGORY;
  }

  preFormat(): this {
    this.setPreFormatted(true);
    return this;
  }

  draw(): void {
    if (!this.stave) throw new RuntimeError('NoStave', "Can't draw without a stave.");

    if (!(this.glyph as Glyph).getContext()) {
      (this.glyph as Glyph).setContext(this.context);
    }

    this.setRendered();
    const abs_x = this.getAbsoluteX();

    (this.glyph as Glyph).setStave(this.stave);
    (this.glyph as Glyph).setYShift(
      this.stave.getYForLine(this.clef.line) - this.stave.getYForGlyphs());
    (this.glyph as Glyph).renderToStave(abs_x);

    // If the Vex.Flow.Clef has an annotation, such as 8va, draw it.
    if (this.clef_obj.annotation !== undefined) {
      const attachment = new Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
      if (!attachment.getContext()) {
        attachment.setContext(this.context);
      }
      attachment.setStave(this.stave);
      attachment.setYShift(
        this.stave.getYForLine(this.clef_obj.annotation.line) - this.stave.getYForGlyphs());
      attachment.setXShift(this.clef_obj.annotation.x_shift);
      attachment.renderToStave(abs_x);
    }
  }
}
