// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Mike Corrigan <corrigan@gmail.com>
//
// This class implements tremolo notation.

import { Vex } from './vex';
import { Modifier } from './modifier';
import { Glyph } from './glyph';
import { GraceNote } from './gracenote';

export class Tremolo extends Modifier {
  static get CATEGORY() { return 'tremolo'; }
  static get YOFFSETSTEMUP() { return -9; }
  static get YOFFSETSTEMDOWN() { return -21; }
  static get XOFFSETSTEMUP() { return 6; }
  static get XOFFSETSTEMDOWN() { return -2; }
  constructor(num) {
    super();
    this.setAttribute('type', 'Tremolo');

    this.num = num;
    this.note = null;
    this.index = null;
    this.position = Modifier.Position.CENTER;
    this.code = 'v74';
  }

  getCategory() { return Tremolo.CATEGORY; }

  draw() {
    this.checkContext();

    if (!(this.note && this.index != null)) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw Tremolo without a note and index.");
    }

    this.setRendered();
    const stemDirection = this.note.getStemDirection();
    this.y_spacing = 4 * stemDirection;
    const start = this.note.getModifierStartXY(this.position, this.index);
    let x = start.x;
    let y = this.note.stem.getExtents().topY;
    const scale = this.note.getCategory() === 'gracenotes' ? GraceNote.SCALE : 1;
    if (stemDirection < 0) {
      y += Tremolo.YOFFSETSTEMDOWN * scale;
    } else {
      y += Tremolo.YOFFSETSTEMUP * scale;
    }

    this.font = {
      family: 'Arial',
      size: 16 * scale,
      weight: '',
    };

    this.render_options = {
      font_scale: 35 * scale,
      stroke_px: 3,
      stroke_spacing: 10 * scale,
    };

    x += stemDirection < 0 ? Tremolo.XOFFSETSTEMDOWN : Tremolo.XOFFSETSTEMUP;
    for (let i = 0; i < this.num; ++i) {
      Glyph.renderGlyph(this.context, x, y, this.render_options.font_scale, this.code);
      y += this.y_spacing;
    }
  }
}
