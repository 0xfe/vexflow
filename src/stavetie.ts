// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { Element } from './element';
import { FontInfo } from './font';
import { Note } from './note';
import { Category } from './typeguard';
import { RuntimeError } from './util';

// For backwards compatibility with 3.0.9, first_note and/or last_note can be undefined or null.
// We prefer undefined instead of null.
// However, some of our test cases used to pass in null, so maybe there is client code relying on it.
export interface TieNotes {
  first_note?: Note | null;
  last_note?: Note | null;
  first_indices?: number[];
  last_indices?: number[];
}

export class StaveTie extends Element {
  static get CATEGORY(): string {
    return Category.StaveTie;
  }

  /** Default text font. */
  static TEXT_FONT: Required<FontInfo> = { ...Element.TEXT_FONT };

  public render_options: {
    cp2: number;
    last_x_shift: number;
    tie_spacing: number;
    cp1: number;
    first_x_shift: number;
    text_shift_x: number;
    y_shift: number;
  };

  protected text?: string;

  // notes is initialized by the constructor via this.setNotes(notes).
  protected notes!: TieNotes;

  protected direction?: number;

  /**
   * @param notes is a struct that has:
   *
   *  {
   *    first_note: Note,
   *    last_note: Note,
   *    first_indices: [n1, n2, n3],
   *    last_indices: [n1, n2, n3]
   *  }
   *
   * @param text
   */
  constructor(notes: TieNotes, text?: string) {
    super();
    this.setNotes(notes);
    this.text = text;
    this.render_options = {
      cp1: 8, // Curve control point 1
      cp2: 12, // Curve control point 2
      text_shift_x: 0,
      first_x_shift: 0,
      last_x_shift: 0,
      y_shift: 7,
      tie_spacing: 0,
    };

    this.resetFont();
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
      throw new RuntimeError('BadArguments', 'Tie needs to have either first_note or last_note set.');
    }

    if (!notes.first_indices) {
      notes.first_indices = [0];
    }
    if (!notes.last_indices) {
      notes.last_indices = [0];
    }

    if (notes.first_indices.length !== notes.last_indices.length) {
      throw new RuntimeError('BadArguments', 'Tied notes must have same number of indices.');
    }

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
      throw new RuntimeError('BadArguments', 'No Y-values to render');
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

    // setNotes(...) verified that first_indices and last_indices are not undefined.
    // As a result, we use the ! non-null assertion operator here.
    // eslint-disable-next-line
    const first_indices = this.notes.first_indices!;
    // eslint-disable-next-line
    const last_indices = this.notes.last_indices!;
    this.applyStyle();
    ctx.openGroup('stavetie', this.getAttribute('id'));
    for (let i = 0; i < first_indices.length; ++i) {
      const cp_x = (params.last_x_px + last_x_shift + (params.first_x_px + first_x_shift)) / 2;
      const first_y_px = params.first_ys[first_indices[i]] + y_shift;
      const last_y_px = params.last_ys[last_indices[i]] + y_shift;

      if (isNaN(first_y_px) || isNaN(last_y_px)) {
        throw new RuntimeError('BadArguments', 'Bad indices for tie rendering.');
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
    ctx.closeGroup();
    this.restoreStyle();
  }

  renderText(first_x_px: number, last_x_px: number): void {
    if (!this.text) return;
    const ctx = this.checkContext();
    let center_x = (first_x_px + last_x_px) / 2;
    center_x -= ctx.measureText(this.text).width / 2;
    const stave = this.notes.first_note?.checkStave() ?? this.notes.last_note?.checkStave();
    if (stave) {
      ctx.save();
      ctx.setFont(this.textFont);
      ctx.fillText(this.text, center_x + this.render_options.text_shift_x, stave.getYForTopText() - 1);
      ctx.restore();
    }
  }

  /**
   * Returns the TieNotes structure of the first and last note this tie connects.
   */
  getNotes(): TieNotes {
    return this.notes;
  }

  draw(): boolean {
    this.checkContext();
    this.setRendered();

    const first_note = this.notes.first_note;
    const last_note = this.notes.last_note;

    // Provide some default values so the compiler doesn't complain.
    let first_x_px = 0;
    let last_x_px = 0;
    let first_ys: number[] = [0];
    let last_ys: number[] = [0];
    let stem_direction = 0;
    if (first_note) {
      first_x_px = first_note.getTieRightX() + this.render_options.tie_spacing;
      stem_direction = first_note.getStemDirection();
      first_ys = first_note.getYs();
    } else if (last_note) {
      const stave = last_note.checkStave();
      first_x_px = stave.getTieStartX();
      first_ys = last_note.getYs();
      this.notes.first_indices = this.notes.last_indices;
    }

    if (last_note) {
      last_x_px = last_note.getTieLeftX() + this.render_options.tie_spacing;
      stem_direction = last_note.getStemDirection();
      last_ys = last_note.getYs();
    } else if (first_note) {
      const stave = first_note.checkStave();
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
