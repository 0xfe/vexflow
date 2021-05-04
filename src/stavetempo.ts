// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Radosaw Eichler 2012

import { Flow } from './tables';
import { StaveModifier } from './stavemodifier';
import { Glyph } from './glyph';
import { FontInfo } from './types/common';
import { Stave } from './stave';

export interface StaveTempoOptions {
  bpm: number;
  dots: number;
  duration: string;
  name: string;
}

export class StaveTempo extends StaveModifier {
  protected font: FontInfo;
  protected render_options: {
    glyph_font_scale: number;
  };

  protected tempo: StaveTempoOptions;
  protected shift_x: number;
  protected shift_y: number;

  static get CATEGORY(): string {
    return 'stavetempo';
  }

  constructor(tempo: StaveTempoOptions, x: number, shift_y: number) {
    super();
    this.setAttribute('type', 'StaveTempo');

    this.tempo = tempo;
    this.position = StaveModifier.Position.ABOVE;
    this.x = x;
    this.shift_x = 10;
    this.shift_y = shift_y;
    this.font = {
      family: 'times',
      size: 14,
      weight: 'bold',
    };
    this.render_options = {
      glyph_font_scale: 30, // font size for note
    };
  }

  getCategory(): string {
    return StaveTempo.CATEGORY;
  }

  setTempo(tempo: StaveTempoOptions): this {
    this.tempo = tempo;
    return this;
  }

  setShiftX(x: number): this {
    this.shift_x = x;
    return this;
  }

  setShiftY(y: number): this {
    this.shift_y = y;
    return this;
  }

  draw(stave: Stave, shift_x: number): this {
    const ctx = stave.checkContext();
    this.setRendered();

    const options = this.render_options;
    // FIXME: What does the '38' mean? Why 38? Is that supposed to
    // be the default font size for standard notation?
    const scale = options.glyph_font_scale / 38;
    const name = this.tempo.name;
    const duration = this.tempo.duration;
    const dots = this.tempo.dots;
    const bpm = this.tempo.bpm;
    const font = this.font;
    let x = this.x + this.shift_x + shift_x;
    const y = stave.getYForTopText(1) + this.shift_y;

    ctx.save();

    if (name) {
      ctx.setFont(font.family, font.size, font.weight);
      ctx.fillText(name, x, y);
      x += ctx.measureText(name).width;
    }

    if (duration && bpm) {
      ctx.setFont(font.family, font.size, 'normal');

      if (name) {
        x += ctx.measureText(' ').width;
        ctx.fillText('(', x, y);
        x += ctx.measureText('(').width;
      }

      const code = Flow.getGlyphProps(duration);

      x += 3 * scale;
      Glyph.renderGlyph(ctx, x, y, options.glyph_font_scale, code.code_head);
      x += code.getWidth() * scale;

      // Draw stem and flags
      if (code.stem) {
        let stem_height = 30;

        if (code.beam_count) stem_height += 3 * (code.beam_count - 1);

        stem_height *= scale;

        const y_top = y - stem_height;
        ctx.fillRect(x - scale, y_top, scale, stem_height);

        if (code.flag) {
          Glyph.renderGlyph(ctx, x, y_top, options.glyph_font_scale, code.code_flag_upstem, {
            category: 'flag.staveTempo',
          });

          if (!dots) x += 6 * scale;
        }
      }

      // Draw dot
      for (let i = 0; i < dots; i++) {
        x += 6 * scale;
        ctx.beginPath();
        ctx.arc(x, y + 2 * scale, 2 * scale, 0, Math.PI * 2, false);
        ctx.fill();
      }

      ctx.fillText(' = ' + bpm + (name ? ')' : ''), x + 3 * scale, y);
    }

    ctx.restore();
    return this;
  }
}
