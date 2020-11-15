// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Copyright Mohit Muthanna 2010
//
// Author Taehoon Moon 2014

import {Vex} from './vex';
import {Note} from './note';
import {Clef} from './clef';
import {Glyph} from './glyph';
import {DrawContext} from "./types/common";
import {IClefType} from "./types/clef";
import {IStaveNoteStruct} from "./types/note";

/** @constructor */
export class ClefNote extends Note {
  private clef_obj: Clef;
  private type: string;
  private clef: IClefType;

  static get CATEGORY() {
    return 'clefnote';
  }

  constructor(type: string, size: string, annotation: string) {
    super({duration: 'b'} as IStaveNoteStruct);
    this.setAttribute('type', 'ClefNote');

    this.setType(type, size, annotation);

    // Note properties
    this.ignore_ticks = true;
  }

  setType(type: string, size: string, annotation: string) {
    this.type = type;
    this.clef_obj = new Clef(type, size, annotation);
    this.clef = this.clef_obj.clef;
    this.glyph = new Glyph(this.clef.code, this.clef.point);
    this.setWidth(this.glyph.getMetrics().width);
    return this;
  }

  getClef() {
    return this.clef;
  }

  setContext(context: DrawContext) {
    this.context = context;
    this.glyph.setContext(this.context);
    return this;
  }

  getBoundingBox() {
    return super.getBoundingBox();
  }

  addToModifierContext() {
    /* overridden to ignore */
    return this;
  }

  getCategory() {
    return ClefNote.CATEGORY;
  }

  preFormat() {
    this.setPreFormatted(true);
    return this;
  }

  draw() {
    if (!this.stave) throw new Vex.RERR('NoStave', "Can't draw without a stave.");

    if (!this.glyph.getContext()) {
      this.glyph.setContext(this.context);
    }

    this.setRendered();
    const abs_x = this.getAbsoluteX();

    this.glyph.setStave(this.stave);
    this.glyph.setYShift(
      this.stave.getYForLine(this.clef.line) - this.stave.getYForGlyphs());
    this.glyph.renderToStave(abs_x);

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
