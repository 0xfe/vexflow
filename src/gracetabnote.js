// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Balazs Forian-Szabo
//
// ## Description
//
// A basic implementation of grace notes
// to be rendered on a tab stave.
//
// See `tests/gracetabnote_tests.js` for usage examples.

import { TabNote } from './tabnote';
import { Flow } from './tables';

export class GraceTabNote extends TabNote {
  static get CATEGORY() { return 'gracetabnotes'; }
  static get SCALE() { return 0.66; }

  constructor(note_struct) {
    super(note_struct, false);
    this.render_options.y_shift = 1;
  }

  getCategory() { return GraceTabNote.CATEGORY; }

  getScale() { return GraceTabNote.SCALE; }

  getFont() { return Flow.TABLATURE_GRACE_FONT; }

  draw() {
    super.draw();
  }
}
