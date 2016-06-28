// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { StaveNote } from './stavenote';

export class GraceNote extends StaveNote {
  static get CATEGORY() { return 'gracenotes'; }

  constructor(note_struct) {
    super(note_struct);

    this.render_options.glyph_font_scale = 22;
    this.render_options.stem_height = 20;
    this.render_options.stroke_px = 2;
    this.glyph.head_width = 6;

    this.slash = note_struct.slash;
    this.slur = true;

    this.buildNoteHeads();

    this.width = 3;
  }

  getStemExtension() {
    const glyph = this.getGlyph();

    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    if (glyph) {
      return this.getStemDirection() === 1 ? glyph.gracenote_stem_up_extension :
        glyph.gracenote_stem_down_extension;
    }

    return 0;
  }

  getCategory() { return GraceNote.CATEGORY; }

  draw() {
    super.draw();
    const ctx = this.context;
    const stem_direction = this.getStemDirection();

    if (this.slash) {
      ctx.beginPath();

      let x = this.getAbsoluteX();
      let y = this.getYs()[0] - (this.stem.getHeight() / 2.8);
      if (stem_direction === 1) {
        x += 1;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 13, y - 9);
      } else if (stem_direction === -1) {
        x -= 4;
        y += 1;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 13, y + 9);
      }

      ctx.closePath();
      ctx.stroke();
    }
  }
}
