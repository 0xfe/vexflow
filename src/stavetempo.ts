// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Radosaw Eichler 2012

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { TextFormatter } from './textformatter';
import { Category } from './typeguard';

export interface StaveTempoOptions {
  bpm?: number;
  duration?: string;
  dots?: number;
  name?: string;
}

export class StaveTempo extends StaveModifier {
  static get CATEGORY(): string {
    return Category.StaveTempo;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: 14,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
  };

  protected tempo: StaveTempoOptions;
  protected shift_x: number;
  protected shift_y: number;
  /** Font size for note. */
  public render_options = { glyph_font_scale: 30 };

  constructor(tempo: StaveTempoOptions, x: number, shift_y: number) {
    super();

    this.tempo = tempo;
    this.position = StaveModifierPosition.ABOVE;
    this.x = x;
    this.shift_x = 10;
    this.shift_y = shift_y;
    this.resetFont();
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
    const scale = options.glyph_font_scale / Tables.NOTATION_FONT_SCALE;
    const name = this.tempo.name;
    const duration = this.tempo.duration;
    const dots = this.tempo.dots || 0;
    const bpm = this.tempo.bpm;
    let x = this.x + this.shift_x + shift_x;
    const y = stave.getYForTopText(1) + this.shift_y;

    ctx.save();
    const textFormatter = TextFormatter.create(this.textFont);

    if (name) {
      ctx.setFont(this.textFont);
      ctx.fillText(name, x, y);
      x += textFormatter.getWidthForTextInPx(name);
    }

    if (duration && bpm) {
      // Override the weight and style.
      const noteTextFont = { ...this.textFont, weight: 'normal', style: 'normal' };
      ctx.setFont(noteTextFont);
      const noteTextFormatter = TextFormatter.create(noteTextFont);

      if (name) {
        x += noteTextFormatter.getWidthForTextInPx('|');
        ctx.fillText('(', x, y);
        x += noteTextFormatter.getWidthForTextInPx('(');
      }

      const glyphProps = Tables.getGlyphProps(duration);

      x += 3 * scale;
      Glyph.renderGlyph(ctx, x, y, options.glyph_font_scale, glyphProps.code_head);
      x += Glyph.getWidth(glyphProps.code_head, options.glyph_font_scale);

      // Draw stem and flags
      if (glyphProps.stem) {
        let stem_height = 30;

        if (glyphProps.beam_count) stem_height += 3 * (glyphProps.beam_count - 1);

        stem_height *= scale;

        const y_top = y - stem_height;
        ctx.fillRect(x - scale, y_top, scale, stem_height);

        if (glyphProps.code && glyphProps.code_flag_upstem) {
          const flagMetrics = Glyph.renderGlyph(ctx, x, y_top, options.glyph_font_scale, glyphProps.code_flag_upstem, {
            category: 'flag.staveTempo',
          });
          x += (flagMetrics.width * Tables.NOTATION_FONT_SCALE) / flagMetrics.font.getData().resolution;
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
