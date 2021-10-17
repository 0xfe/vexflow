// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Balazs Forian-Szabo
//
// ## Description
//
// A basic implementation of grace notes
// to be rendered on a tab stave.
//
// See `tests/gracetabnote_tests.ts` for usage examples.

import { TabNote, TabNoteStruct } from './tabnote';

export class GraceTabNote extends TabNote {
  static get CATEGORY(): string {
    return 'GraceTabNote';
  }

  constructor(noteStruct: TabNoteStruct) {
    super(noteStruct, false);

    this.render_options = {
      ...this.render_options,
      // vertical shift from stave line
      y_shift: 0.3,
      // grace glyph scale
      scale: 0.6,
      // grace tablature font
      font: '7.5pt Arial',
    };

    this.updateWidth();
  }
}
