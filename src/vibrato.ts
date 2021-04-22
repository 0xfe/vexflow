// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class implements vibratos.

import { Vex } from './vex';
import { Modifier } from './modifier';
import { Bend } from './bend';

export class Vibrato extends Modifier {
  static get CATEGORY() {
    return 'vibratos';
  }

  // ## Static Methods
  // Arrange vibratos inside a `ModifierContext`.
  static format(vibratos, state, context) {
    if (!vibratos || vibratos.length === 0) return false;

    // Vibratos are always on top.
    let text_line = state.top_text_line;
    let width = 0;
    let shift = state.right_shift - 7;

    // If there's a bend, drop the text line
    const bends = context.getModifiers(Bend.CATEGORY);
    if (bends && bends.length > 0) {
      text_line--;
    }

    // Format Vibratos
    for (let i = 0; i < vibratos.length; ++i) {
      const vibrato = vibratos[i];
      vibrato.setXShift(shift);
      vibrato.setTextLine(text_line);
      width += vibrato.getWidth();
      shift += width;
    }

    state.right_shift += width;
    state.top_text_line += 1;
    return true;
  }

  // ## Prototype Methods
  constructor() {
    super();
    this.setAttribute('type', 'Vibrato');

    this.position = Modifier.Position.RIGHT;
    this.render_options = {
      harsh: false,
      vibrato_width: 20,
      wave_height: 6,
      wave_width: 4,
      wave_girth: 2,
    };

    this.setVibratoWidth(this.render_options.vibrato_width);
  }
  getCategory() {
    return Vibrato.CATEGORY;
  }
  setHarsh(harsh) {
    this.render_options.harsh = harsh;
    return this;
  }
  setVibratoWidth(width) {
    this.render_options.vibrato_width = width;
    this.setWidth(width);
    return this;
  }

  draw() {
    const ctx = this.checkContext();

    if (!this.note) {
      throw new Vex.RERR('NoNoteForVibrato', "Can't draw vibrato without an attached note.");
    }

    this.setRendered();
    const start = this.note.getModifierStartXY(Modifier.Position.RIGHT, this.index);

    const vx = start.x + this.x_shift;
    const vy = this.note.getYForTopText(this.text_line) + 2;

    Vibrato.renderVibrato(ctx, vx, vy, this.render_options);
  }

  // Static rendering method that can be called from
  // other classes (e.g. VibratoBracket)
  static renderVibrato(ctx, x, y, opts) {
    const { harsh, vibrato_width, wave_width, wave_girth, wave_height } = opts;
    const num_waves = vibrato_width / wave_width;

    ctx.beginPath();

    let i;
    if (harsh) {
      ctx.moveTo(x, y + wave_girth + 1);
      for (i = 0; i < num_waves / 2; ++i) {
        ctx.lineTo(x + wave_width, y - wave_height / 2);
        x += wave_width;
        ctx.lineTo(x + wave_width, y + wave_height / 2);
        x += wave_width;
      }
      for (i = 0; i < num_waves / 2; ++i) {
        ctx.lineTo(x - wave_width, y - wave_height / 2 + wave_girth + 1);
        x -= wave_width;
        ctx.lineTo(x - wave_width, y + wave_height / 2 + wave_girth + 1);
        x -= wave_width;
      }
      ctx.fill();
    } else {
      ctx.moveTo(x, y + wave_girth);
      for (i = 0; i < num_waves / 2; ++i) {
        ctx.quadraticCurveTo(x + wave_width / 2, y - wave_height / 2, x + wave_width, y);
        x += wave_width;
        ctx.quadraticCurveTo(x + wave_width / 2, y + wave_height / 2, x + wave_width, y);
        x += wave_width;
      }

      for (i = 0; i < num_waves / 2; ++i) {
        ctx.quadraticCurveTo(x - wave_width / 2, y + wave_height / 2 + wave_girth, x - wave_width, y + wave_girth);
        x -= wave_width;
        ctx.quadraticCurveTo(x - wave_width / 2, y - wave_height / 2 + wave_girth, x - wave_width, y + wave_girth);
        x -= wave_width;
      }
      ctx.fill();
    }
  }
}
