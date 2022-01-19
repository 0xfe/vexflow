// / [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { StaveTie, TieNotes } from './stavetie';
import { Category } from './typeguard';

export class TabTie extends StaveTie {
  static get CATEGORY(): string {
    return Category.TabTie;
  }

  static createHammeron(notes: TieNotes): TabTie {
    return new TabTie(notes, 'H');
  }

  static createPulloff(notes: TieNotes): TabTie {
    return new TabTie(notes, 'P');
  }

  /**
   * @param notes is a struct that has:
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
    super(notes, text);

    this.render_options.cp1 = 9;
    this.render_options.cp2 = 11;
    this.render_options.y_shift = 3;

    this.direction = -1; // Tab tie's are always face up.
  }
}
