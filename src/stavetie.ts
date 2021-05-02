// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { Vex } from './vex';
import { Element } from './element';

export class StaveTie extends Element {
  constructor(notes, text) {
    /**
     * Notes is a struct that has:
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
    this.context = null;
    this.text = text;
    this.direction = null;

    this.render_options = {
      cp1: 8, // Curve control point 1
      cp2: 12, // Curve control point 2
      text_shift_x: 0,
      first_x_shift: 0,
      last_x_shift: 0,
      y_shift: 7,
      tie_spacing: 0,
      font: { family: 'Arial', size: 10, style: '' },
    };

    this.font = this.render_options.font;
    this.setNotes(notes);
  }

  setFont(font) {
    this.font = font;
    return this;
  }
  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  /**
   * Set the notes to attach this tie to.
   *
   * @param {!Object} notes The notes to tie up.
   */
  setNotes(notes) {
    if (!notes.first_note && !notes.last_note) {
      throw new Vex.RuntimeError('BadArguments', 'Tie needs to have either first_note or last_note set.');
    }

    if (!notes.first_indices) notes.first_indices = [0];
    if (!notes.last_indices) notes.last_indices = [0];

    if (notes.first_indices.length !== notes.last_indices.length) {
      throw new Vex.RuntimeError('BadArguments', 'Tied notes must have similar index sizes');
    }

    // Success. Lets grab 'em notes.
    this.first_note = notes.first_note;
    this.first_indices = notes.first_indices;
    this.last_note = notes.last_note;
    this.last_indices = notes.last_indices;
    return this;
  }

  /**
   * @return {boolean} Returns true if this is a partial bar.
   */
  isPartial() {
    return !this.first_note || !this.last_note;
  }

  renderTie(params) {
    if (params.first_ys.length === 0 || params.last_ys.length === 0) {
      throw new Vex.RERR('BadArguments', 'No Y-values to render');
    }

    const ctx = this.context;
    let cp1 = this.render_options.cp1;
    let cp2 = this.render_options.cp2;

    if (Math.abs(params.last_x_px - params.first_x_px) < 10) {
      cp1 = 2;
      cp2 = 8;
    }

    const first_x_shift = this.render_options.first_x_shift;
    const last_x_shift = this.render_options.last_x_shift;
    const y_shift = this.render_options.y_shift * params.direction;

    for (let i = 0; i < this.first_indices.length; ++i) {
      const cp_x = (params.last_x_px + last_x_shift + (params.first_x_px + first_x_shift)) / 2;
      const first_y_px = params.first_ys[this.first_indices[i]] + y_shift;
      const last_y_px = params.last_ys[this.last_indices[i]] + y_shift;

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

  renderText(first_x_px, last_x_px) {
    if (!this.text) return;
    let center_x = (first_x_px + last_x_px) / 2;
    center_x -= this.context.measureText(this.text).width / 2;

    this.context.save();
    this.context.setFont(this.font.family, this.font.size, this.font.style);
    this.context.fillText(
      this.text,
      center_x + this.render_options.text_shift_x,
      (this.first_note || this.last_note).getStave().getYForTopText() - 1
    );
    this.context.restore();
  }

  draw() {
    this.checkContext();
    this.setRendered();

    const first_note = this.first_note;
    const last_note = this.last_note;

    let first_x_px;
    let last_x_px;
    let first_ys;
    let last_ys;
    let stem_direction;
    if (first_note) {
      first_x_px = first_note.getTieRightX() + this.render_options.tie_spacing;
      stem_direction = first_note.getStemDirection();
      first_ys = first_note.getYs();
    } else {
      first_x_px = last_note.getStave().getTieStartX();
      first_ys = last_note.getYs();
      this.first_indices = this.last_indices;
    }

    if (last_note) {
      last_x_px = last_note.getTieLeftX() + this.render_options.tie_spacing;
      stem_direction = last_note.getStemDirection();
      last_ys = last_note.getYs();
    } else {
      last_x_px = first_note.getStave().getTieEndX();
      last_ys = first_note.getYs();
      this.last_indices = this.first_indices;
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
