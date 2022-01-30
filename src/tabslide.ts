// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { TieNotes } from './stavetie';
import { TabNote } from './tabnote';
import { TabTie } from './tabtie';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export class TabSlide extends TabTie {
  static get CATEGORY(): string {
    return Category.TabSlide;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: 10,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
  };

  static get SLIDE_UP(): number {
    return 1;
  }

  static get SLIDE_DOWN(): number {
    return -1;
  }

  static createSlideUp(notes: TieNotes): TabSlide {
    return new TabSlide(notes, TabSlide.SLIDE_UP);
  }

  static createSlideDown(notes: TieNotes): TabSlide {
    return new TabSlide(notes, TabSlide.SLIDE_DOWN);
  }

  /**
   * @param notes is a struct of the form:
   *  {
   *    first_note: Note,
   *    last_note: Note,
   *    first_indices: [n1, n2, n3],
   *    last_indices: [n1, n2, n3]
   *  }
   * @param notes.first_note the starting note of the slide
   * @param notes.last_note the ending note of the slide
   * @param notes.first_indices specifies which string + fret positions of the TabNote are used in this slide. zero indexed.
   * @param notes.last_indices currently unused. we assume it's the same as first_indices.
   *
   * @param direction TabSlide.SLIDE_UP or TabSlide.SLIDE_DOWN
   */
  constructor(notes: TieNotes, direction?: number) {
    super(notes, 'sl.');

    // Determine the direction automatically if it is not provided.
    if (!direction) {
      let first_fret = (notes.first_note as TabNote).getPositions()[0].fret;
      if (typeof first_fret === 'string') {
        first_fret = parseInt(first_fret, 10);
      }
      let last_fret = (notes.last_note as TabNote).getPositions()[0].fret;
      if (typeof last_fret === 'string') {
        last_fret = parseInt(last_fret, 10);
      }

      // If either of the frets are 'X', parseInt() above will return NaN.
      // Choose TabSlide.SLIDE_UP by default.
      if (isNaN(first_fret) || isNaN(last_fret)) {
        direction = TabSlide.SLIDE_UP;
      } else {
        direction = first_fret > last_fret ? TabSlide.SLIDE_DOWN : TabSlide.SLIDE_UP;
      }
    }

    this.direction = direction;
    this.render_options.cp1 = 11;
    this.render_options.cp2 = 14;
    this.render_options.y_shift = 0.5;

    this.resetFont();
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
    const first_x_px = params.first_x_px;
    const first_ys = params.first_ys;
    const last_x_px = params.last_x_px;

    const direction = params.direction;
    if (direction !== TabSlide.SLIDE_UP && direction !== TabSlide.SLIDE_DOWN) {
      throw new RuntimeError('BadSlide', 'Invalid slide direction');
    }

    // eslint-disable-next-line
    const first_indices = this.notes.first_indices!;
    for (let i = 0; i < first_indices.length; ++i) {
      const slide_y = first_ys[first_indices[i]] + this.render_options.y_shift;

      if (isNaN(slide_y)) {
        throw new RuntimeError('BadArguments', 'Bad indices for slide rendering.');
      }

      ctx.beginPath();
      ctx.moveTo(first_x_px, slide_y + 3 * direction);
      ctx.lineTo(last_x_px, slide_y - 3 * direction);
      ctx.closePath();
      ctx.stroke();
    }

    this.setRendered();
  }
}
