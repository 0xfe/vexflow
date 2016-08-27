// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { Stave } from './stave';

export class TabStave extends Stave {
  constructor(x, y, width, options) {
    const tab_options = {
      spacing_between_lines_px: 13,
      num_lines: 6,
      top_text_position: 1,
    };

    Vex.Merge(tab_options, options);
    super(x, y, width, tab_options);
    this.setAttribute('type', 'TabStave');
  }

  getYForGlyphs() {
    return this.getYForLine(2.5);
  }

  // Deprecated
  addTabGlyph() {
    this.addClef('tab');
    return this;
  }
}
