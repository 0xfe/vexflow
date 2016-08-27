// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { StaveNote } from './stavenote';
import { Flow } from './tables';

export class GraceNote extends StaveNote {
  static get CATEGORY() { return 'gracenotes'; }
  static get LEDGER_LINE_OFFSET() { return 2; }
  static get SCALE() { return 0.66; }

  constructor(note_struct) {
    super(Object.assign(note_struct, {
      glyph_font_scale: Flow.DEFAULT_NOTATION_FONT_SCALE * GraceNote.SCALE,
      stroke_px: GraceNote.LEDGER_LINE_OFFSET,
    }));
    this.setAttribute('type', 'GraceNote');

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
      return this.getStemDirection() === 1
        ? glyph.gracenote_stem_up_extension
        : glyph.gracenote_stem_down_extension;
    }

    return 0;
  }

  getCategory() { return GraceNote.CATEGORY; }

  draw() {
    super.draw();
    this.setRendered();
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
