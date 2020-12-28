// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import {Vex} from './vex';
import {TabTie} from './tabtie';
import {TabNote} from "./tabnote";
import {INotesStruct} from "./types/note";
import {IFont} from "./types/font";
import {ITabSlideRenderTieParams} from "./types/tabslide";

export class TabSlide extends TabTie {
  private readonly slide_direction: number;

  static get SLIDE_UP(): number {
    return 1;
  }

  static get SLIDE_DOWN(): number {
    return -1;
  }

  static createSlideUp(notes: INotesStruct): TabSlide {
    return new TabSlide(notes, TabSlide.SLIDE_UP);
  }

  static createSlideDown(notes: INotesStruct): TabSlide {
    return new TabSlide(notes, TabSlide.SLIDE_DOWN);
  }

  constructor(notes: INotesStruct, direction: number) {
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
    super(notes, 'sl.');
    this.setAttribute('type', 'TabSlide');

    if (!direction) {
      const first_fret = (notes.first_note as TabNote).getPositions()[0].fret;
      const last_fret = (notes.last_note as TabNote).getPositions()[0].fret;

      direction = ((parseInt(first_fret, 10) > parseInt(last_fret, 10)) ?
        TabSlide.SLIDE_DOWN : TabSlide.SLIDE_UP);
    }

    this.slide_direction = direction;
    this.render_options.cp1 = 11;
    this.render_options.cp2 = 14;
    this.render_options.y_shift = 0.5;

    this.setFont({font: 'Times', size: 10, style: 'bold italic'} as IFont);
    this.setNotes(notes);
  }

  renderTie(params: ITabSlideRenderTieParams): void {
    if (params.first_ys.length === 0 || params.last_ys.length === 0) {
      throw new Vex.RERR('BadArguments', 'No Y-values to render');
    }

    const ctx = this.context;
    const first_x_px = params.first_x_px;
    const first_ys = params.first_ys;
    const last_x_px = params.last_x_px;

    const direction = this.slide_direction;
    if (direction !== TabSlide.SLIDE_UP && direction !== TabSlide.SLIDE_DOWN) {
      throw new Vex.RERR('BadSlide', 'Invalid slide direction');
    }

    for (let i = 0; i < this.first_indices.length; ++i) {
      const slide_y = first_ys[this.first_indices[i]] +
        this.render_options.y_shift;

      if (isNaN(slide_y)) {
        throw new Vex.RERR('BadArguments', 'Bad indices for slide rendering.');
      }

      ctx.beginPath();
      ctx.moveTo(first_x_px, slide_y + (3 * direction));
      ctx.lineTo(last_x_px, slide_y - (3 * direction));
      ctx.closePath();
      ctx.stroke();
    }

    this.setRendered();
  }
}
