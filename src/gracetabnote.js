// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Balazs Forian-Szabo
//
// ## Description
//
// A basic implementation of grace notes
// to be rendered on a tab stave.
//
// See `tests/gracetabnote_tests.js` for usage examples.

import { Vex } from './vex';
import { TabNote } from './tabnote';

export class GraceTabNote extends TabNote {
  static get CATEGORY() {
    return 'gracetabnotes';
  }

  constructor(note_struct) {
    super(note_struct, false);
    this.setAttribute('type', 'GraceTabNote');

    Vex.Merge(this.render_options, {
      // vertical shift from stave line
      y_shift: 0.3,
      // grace glyph scale
      scale: 0.6,
      // grace tablature font
      font: '7.5pt Arial',
    });

    this.updateWidth();
  }

  getCategory() {
    return GraceTabNote.CATEGORY;
  }

  draw() {
    super.draw();
    this.setRendered();
  }
}
