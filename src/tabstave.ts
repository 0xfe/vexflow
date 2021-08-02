// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Stave, StaveOptions } from './stave';

export class TabStave extends Stave {
  constructor(x: number, y: number, width: number, options?: Partial<StaveOptions>) {
    const tab_options = {
      ...{
        spacing_between_lines_px: 13,
        num_lines: 6,
        top_text_position: 1,
      },
      ...options,
    };

    super(x, y, width, tab_options);
    this.setAttribute('type', 'TabStave');
  }

  getYForGlyphs(): number {
    return this.getYForLine(2.5);
  }

  // Deprecated
  addTabGlyph(): this {
    this.addClef('tab');
    return this;
  }
}
