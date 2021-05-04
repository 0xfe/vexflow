// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { Vex } from './vex';
import { Element } from './element';
import { FontInfo, TieNotes } from './types/common';

export class StaveTie extends Element {
  render_options: {
    cp2: number;
    last_x_shift: number;
    tie_spacing: number;
    cp1: number;
    first_x_shift: number;
    text_shift_x: number;
    y_shift: number;
    font: FontInfo;
  };

  protected text?: string;

  protected font: FontInfo;
  protected notes: TieNotes;
  protected direction?: number;

  constructor(notes: TieNotes, text?: string) {
    /**
     * TieNotes is a struct that has:
     *
     *  {
     *    first_note: Note,
     *    last_note: Note,
     *    first_indices: [n1, n2, n3],
     *    last_indices: [n1, n2, n3]
     *  }
     *
     **/
    super();
    this.setAttribute('type', 'StaveTie');
    this.notes = notes;
    this.text = text;
    this.render_options = {
      cp1: 8, // Curve control point 1
      cp2: 12, // Curve control point 2
      text_shift_x: 0,
      first_x_shift: 0,
      last_x_shift: 0,
      y_shift: 7,
      tie_spacing: 0,
      font: { family: 'Arial', size: 10, weight: '' },
    };

    this.font = this.render_options.font;
    this.setNotes(notes);
  }

  setFont(font: FontInfo): this {
    this.font = font;
    return this;
  }

  setDirection(direction: number): this {
    this.direction = direction;
    return this;
  }

  /**
   * Set the notes to attach this tie to.
   *
   * @param {!Object} notes The notes to tie up.
   */
  setNotes(notes: TieNotes): this {
    if (!notes.first_note && !notes.last_note) {
      throw new Vex.RuntimeError('BadArguments', 'Tie needs to have either first_note or last_note set.');
    }

    if (!notes.first_indices) notes.first_indices = [0];
    if (!notes.last_indices) notes.last_indices = [0];

    if (notes.first_indices.length !== notes.last_indices.length) {
      throw new Vex.RuntimeError('BadArguments', 'Tied notes must have similar index sizes');
    }

    // Success. Lets grab 'em notes.
    this.notes = notes;
    return this;
  }

  /**
   * @return {boolean} Returns true if this is a partial bar.
   */
  isPartial(): boolean {
    return !this.notes.first_note || !this.notes.last_note;
  }

  renderTie(params: {
    direction: number;
    first_x_px: number;
    last_x_px: number;
    last_ys: number[];
    first_ys: number[];
  }): void {
    if (params.first_ys.length === 0 || params.last_ys.length === 0) {
      throw new Vex.RERR('BadArguments', 'No Y-values to render');
    }

    const ctx = this.checkContext();
    let cp1 = this.render_options.cp1;
    let cp2 = this.render_options.cp2;

    if (Math.abs(params.last_x_px - params.first_x_px) < 10) {
      cp1 = 2;
      cp2 = 8;
    }

    const first_x_shift = this.render_options.first_x_shift;
    const last_x_shift = this.render_options.last_x_shift;
    const y_shift = this.render_options.y_shift * params.direction;

    for (let i = 0; i < this.notes.first_indices.length; ++i) {
      const cp_x = (params.last_x_px + last_x_shift + (params.first_x_px + first_x_shift)) / 2;
      const first_y_px = params.first_ys[this.notes.first_indices[i]] + y_shift;
      const last_y_px = params.last_ys[this.notes.last_indices[i]] + y_shift;

      if (isNaN(first_y_px) || isNaN(last_y_px)) {
        throw new Vex.RERR('BadArguments', 'Bad indices for tie rendering.');
      }

      const top_cp_y = (first_y_px + last_y_px) / 2 + cp1 * params.direction;
      const bottom_cp_y = (first_y_px + last_y_px) / 2 + cp2 * params.direction;

      ctx.beginPath();
      ctx.moveTo(params.first_x_px + first_x_shift, first_y_px);
      ctx.quadraticCurveTo(cp_x, top_cp_y, params.last_x_px + last_x_shift, last_y_px);
      ctx.quadraticCurveTo(cp_x, bottom_cp_y, params.first_x_px + first_x_shift, first_y_px);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderText(first_x_px: number, last_x_px: number): void {
    if (!this.text) return;
    const ctx = this.checkContext();
    let center_x = (first_x_px + last_x_px) / 2;
    center_x -= ctx.measureText(this.text).width / 2;
    const stave = this.notes.first_note?.getStave() ?? this.notes.last_note?.getStave();

    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    ctx.fillText(this.text, center_x + this.render_options.text_shift_x, stave!.getYForTopText() - 1);
    ctx.restore();
  }

  draw(): boolean {
    this.checkContext();
    this.setRendered();

    const first_note = this.notes.first_note;
    const last_note = this.notes.last_note;

    let first_x_px;
    let last_x_px;
    let first_ys;
    let last_ys;
    let stem_direction = 0;
    if (first_note) {
      first_x_px = first_note.getTieRightX() + this.render_options.tie_spacing;
      stem_direction = first_note.getStemDirection();
      first_ys = first_note.getYs();
    } else {
      const stave = last_note.getStave();
      if (!stave) {
        throw new Vex.RERR('NoStave', 'Stave required');
      }
      first_x_px = stave.getTieStartX();
      first_ys = last_note.getYs();
      this.notes.first_indices = this.notes.last_indices;
    }

    if (last_note) {
      last_x_px = last_note.getTieLeftX() + this.render_options.tie_spacing;
      stem_direction = last_note.getStemDirection();
      last_ys = last_note.getYs();
    } else {
      const stave = first_note.getStave();
      if (!stave) {
        throw new Vex.RERR('NoStave', 'Stave required');
      }
      last_x_px = stave.getTieEndX();
      last_ys = first_note.getYs();
      this.notes.last_indices = this.notes.first_indices;
    }

    if (this.direction) {
      stem_direction = this.direction;
    }

    this.renderTie({
      first_x_px,
      last_x_px,
      first_ys,
      last_ys,
      direction: stem_direction,
    });

    this.renderText(first_x_px, last_x_px);
    return true;
  }
}
