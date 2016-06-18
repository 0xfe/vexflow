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
    var text_line = state.top_text_line;
    var width = 0;
    var shift = state.right_shift - 7;

    // If there's a bend, drop the text line
    var bends = context.getModifiers(Bend.CATEGORY);
    if (bends && bends.length > 0) {
      text_line--;
    }

    // Format Vibratos
    for (var i = 0; i < vibratos.length; ++i) {
      var vibrato = vibratos[i];
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

    this.harsh = false;
    this.position = Modifier.Position.RIGHT;
    this.render_options = {
      vibrato_width: 20,
      wave_height: 6,
      wave_width: 4,
      wave_girth: 2
    };

    this.setVibratoWidth(this.render_options.vibrato_width);
  }
  getCategory() {
    return Vibrato.CATEGORY;
  }
  setHarsh(harsh) { this.harsh = harsh; return this; }
  setVibratoWidth(width) {
    this.vibrato_width = width;
    this.setWidth(this.vibrato_width);
    return this;
  }

  draw() {
    if (!this.context) throw new Vex.RERR("NoContext",
      "Can't draw vibrato without a context.");
    if (!this.note) throw new Vex.RERR("NoNoteForVibrato",
      "Can't draw vibrato without an attached note.");

    var start = this.note.getModifierStartXY(Modifier.Position.RIGHT,
        this.index);

    var ctx = this.context;
    var that = this;
    var vibrato_width = this.vibrato_width;

    function renderVibrato(x, y) {
      var wave_width = that.render_options.wave_width;
      var wave_girth = that.render_options.wave_girth;
      var wave_height = that.render_options.wave_height;
      var num_waves = vibrato_width / wave_width;

      ctx.beginPath();

      var i;
      if (that.harsh) {
        ctx.moveTo(x, y + wave_girth + 1);
        for (i = 0; i < num_waves / 2; ++i) {
          ctx.lineTo(x + wave_width, y - (wave_height / 2));
          x += wave_width;
          ctx.lineTo(x + wave_width, y + (wave_height / 2));
          x += wave_width;
        }
        for (i = 0; i < num_waves / 2; ++i) {
          ctx.lineTo(x - wave_width, (y - (wave_height / 2)) + wave_girth + 1);
          x -= wave_width;
          ctx.lineTo(x - wave_width, (y + (wave_height / 2)) + wave_girth + 1);
          x -= wave_width;
        }
        ctx.fill();
      } else {
        ctx.moveTo(x, y + wave_girth);
        for (i = 0; i < num_waves / 2; ++i) {
          ctx.quadraticCurveTo(x + (wave_width / 2), y - (wave_height / 2),
            x + wave_width, y);
          x += wave_width;
          ctx.quadraticCurveTo(x + (wave_width / 2), y + (wave_height / 2),
            x + wave_width, y);
          x += wave_width;
        }

        for (i = 0; i < num_waves / 2; ++i) {
          ctx.quadraticCurveTo(
              x - (wave_width / 2),
              (y + (wave_height / 2)) + wave_girth,
              x - wave_width, y + wave_girth);
          x -= wave_width;
          ctx.quadraticCurveTo(
              x - (wave_width / 2),
              (y - (wave_height / 2)) + wave_girth,
              x - wave_width, y + wave_girth);
          x -= wave_width;
        }
        ctx.fill();
      }
    }

    var vx = start.x + this.x_shift;
    var vy = this.note.getYForTopText(this.text_line) + 2;

    renderVibrato(vx, vy);
  }
}
