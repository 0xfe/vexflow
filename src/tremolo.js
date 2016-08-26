// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Mike Corrigan <corrigan@gmail.com>
//
// This class implements tremolo notation.

import { Vex } from './vex';
import { Modifier } from './modifier';
import { Glyph } from './glyph';

export class Tremolo extends Modifier {
  static get CATEGORY() { return 'tremolo'; }
  constructor(num) {
    super();
    this.setAttribute('type', 'Tremolo');

    this.num = num;
    this.note = null;
    this.index = null;
    this.position = Modifier.Position.CENTER;
    this.code = 'v74';
    this.shift_right = -2;
    this.y_spacing = 4;

    this.render_options = {
      font_scale: 35,
      stroke_px: 3,
      stroke_spacing: 10,
    };

    this.font = {
      family: 'Arial',
      size: 16,
      weight: '',
    };
  }

  getCategory() { return Tremolo.CATEGORY; }

  draw() {
    this.checkContext();

    if (!(this.note && this.index != null)) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw Tremolo without a note and index.");
    }

    this.setRendered();
    const start = this.note.getModifierStartXY(this.position, this.index);
    let x = start.x;
    let y = start.y;

    x += this.shift_right;
    for (let i = 0; i < this.num; ++i) {
      Glyph.renderGlyph(this.context, x, y, this.render_options.font_scale, this.code);
      y += this.y_spacing;
    }
  }
}
