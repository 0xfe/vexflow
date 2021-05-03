// / [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { Notes, StaveTie } from './stavetie';

export class TabTie extends StaveTie {
  static createHammeron(notes: Notes): TabTie {
    return new TabTie(notes, 'H');
  }

  static createPulloff(notes: Notes): TabTie {
    return new TabTie(notes, 'P');
  }

  constructor(notes: Notes, text?: string) {
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
    super(notes, text);
    this.setAttribute('type', 'TabTie');

    this.render_options.cp1 = 9;
    this.render_options.cp2 = 11;
    this.render_options.y_shift = 3;

    this.direction = -1; // Tab tie's are always face up.

    this.setNotes(notes);
  }
}
